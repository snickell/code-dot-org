import {MicropythonFsHex} from '@microbit/microbit-fs';
import {DAPLink, WebUSB} from 'dapjs';

import {
  MICROBIT_FIRMATA_V1_URL,
  MICROBIT_FIRMATA_V2_URL,
  MICROBIT_IDS_V1,
  MICROBIT_IDS_V2,
  MICROBIT_MICROPYTHON_V1_URL,
  MICROBIT_MICROPYTHON_V2_URL,
  MICROBIT_VENDOR_ID,
  MICROBIT_PRODUCT_ID,
} from '@cdo/apps/maker/boards/microBit/MicroBitConstants';
import {MicroBitVersion} from '@cdo/apps/maker/boards/microBit/types';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';

import {
  loadAddr,
  dataAddr,
  stackAddr,
  computeChecksums2,
  flashPageBIN,
} from './constants';
import {DAPWrapper} from './DapWrapper';
import {
  onlyChanged,
  pageAlignBlocks,
  CoreRegister,
} from './partialFlashingUtils';
import {Page} from './types';

export const detectMicroBitVersion = (device: USBDevice) => {
  // Detect micro:bit version V1 or V2 from the first 4 digits of the micro:bit's serial number
  // Documentation at https://support.microbit.org/support/solutions/articles/19000035697-what-are-the-usb-vid-pid-numbers-for-micro-bit
  if (!device.serialNumber) {
    return;
  }
  const microBitId = device.serialNumber?.substring(0, 4);
  let microBitVersion = null;
  if (MICROBIT_IDS_V1.includes(microBitId)) {
    microBitVersion = MicroBitVersion.V1;
  } else if (MICROBIT_IDS_V2.includes(microBitId)) {
    microBitVersion = MicroBitVersion.V2;
  }
  analyticsReporter.sendEvent(EVENTS.MAKER_SETUP_PAGE_MB_VERSION_EVENT, {
    'Microbit Version': microBitVersion,
  });

  return microBitVersion;
};

export const getFirmataURLByVersion = (microBitVersion: MicroBitVersion) => {
  if (
    microBitVersion !== MicroBitVersion.V1 &&
    microBitVersion !== MicroBitVersion.V2
  ) {
    throw new Error('micro:bit version is invalid.');
  }
  return microBitVersion === MicroBitVersion.V1
    ? MICROBIT_FIRMATA_V1_URL
    : MICROBIT_FIRMATA_V2_URL;
};

export const flashHexString = async (hexString: string, device: USBDevice) => {
  const transport = new WebUSB(device);
  const target = new DAPLink(transport); // this.daplink in python-editor-v2 dap-wrapper.ts line 38.
  // For now, log flash progress in dev console.
  target.on(DAPLink.EVENT_PROGRESS, progress => {
    if (Math.floor(progress * 100) % 10 === 0) {
      console.log('progress percent', Math.floor(progress * 100));
    }
    if (progress === 1) {
      console.log('FLASH COMPLETE');
    }
  });
  // Intel Hex is currently in ASCII, do a 1-to-1 conversion from chars to bytes
  const hexAsBytes = new TextEncoder().encode(hexString);
  // Push binary to board
  await target.connect();
  await target.flash(hexAsBytes);
  await target.disconnect();
};

export const sendPythonCodeToMicroBit = async (pythonCode: string) => {
  const device = await navigator.usb.requestDevice({
    filters: [{vendorId: MICROBIT_VENDOR_ID, productId: MICROBIT_PRODUCT_ID}],
  });
  const dapWrapper = new DAPWrapper(device);
  await dapWrapper.reconnectAsync();
  await dapWrapper.reset(true);
  const microBitVersion = detectMicroBitVersion(device);
  if (!microBitVersion) {
    throw new Error('micro:bit version not detected correctly.');
  }

  const fs = await getMicropythonFsHex(pythonCode, microBitVersion);
  const hexStrWithFiles = fs.getIntelHex();
  const flashBytes = await partialFlashData(fs);
  console.log('flashBytes', flashBytes);

  const checkSums = await getFlashChecksumsAsync(dapWrapper);
  console.log('checkSums', checkSums);
  dapWrapper.writeBlockAsync(loadAddr, flashPageBIN);
  let aligned = pageAlignBlocks(flashBytes, 0, dapWrapper.pageSize);
  const totalPages = aligned.length;
  console.log('Total pages: ' + totalPages);
  aligned = onlyChanged(aligned, checkSums, dapWrapper.pageSize);
  console.log('Changed pages: ' + aligned.length);
  if (aligned.length > totalPages / 2) {
    try {
      console.log('Partial flash beginning...');
      await flashHexString(hexStrWithFiles, device);
    } catch (error) {
      console.log(error);
      return Promise.reject('Failed to send MicroPython program to micro:bit.');
    }
  } else {
    console.log('Full flash beginning...');
    try {
      await partialFlashCoreAsync(dapWrapper, aligned);
    } catch (e) {
      console.log(e);
      console.log('Partial flash failed, attempting full flash.');
      await flashHexString(hexStrWithFiles, device);
    }
  }
};

// Write pages of data to micro:bit ROM.
const partialFlashCoreAsync = async (dapWrapper: DAPWrapper, pages: Page[]) => {
  for (let i = 0; i < pages.length; ++i) {
    console.log(`page ${i + 1} out of ${pages.length}`);
    await partialFlashPageAsync(dapWrapper, pages[i], pages[i + 1], i);
  }
  console.log('FLASH COMPLETE');
};

const partialFlashPageAsync = async (
  dapWrapper: DAPWrapper,
  page: Page,
  nextPage: Page,
  i: number
): Promise<void> => {
  // TODO: This short-circuits UICR, do we need to update this?
  if (page.targetAddr >= 0x10000000) {
    return;
  }

  // Use two slots in RAM to allow parallelisation of the following two tasks.
  // 1. DAPjs writes a page to one slot.
  // 2. flashPageBIN copies a page to flash from the other slot.
  const thisAddr = i & 1 ? dataAddr : dataAddr + dapWrapper.pageSize;
  const nextAddr = i & 1 ? dataAddr + dapWrapper.pageSize : dataAddr;

  // Write first page to slot in RAM.
  // All subsequent pages will have already been written to RAM.
  if (i === 0) {
    const u32data = new Uint32Array(page.data.length / 4);
    for (let j = 0; j < page.data.length; j += 4) {
      u32data[j >> 2] = read32FromUInt8Array(page.data, j);
    }
    await dapWrapper.writeBlockAsync(thisAddr, u32data);
  }

  await runFlash(dapWrapper, page, thisAddr);
  // Write next page to micro:bit RAM if it exists.
  if (nextPage) {
    const buf = new Uint32Array(nextPage.data.buffer);
    await dapWrapper.writeBlockAsync(nextAddr, buf);
  }
  return dapWrapper.waitForHalt();
};

const runFlash = async (
  dapWrapper: DAPWrapper,
  page: Page,
  addr: number
): Promise<void> => {
  await dapWrapper.cortexM.halt(true);
  await Promise.all([
    dapWrapper.cortexM.writeCoreRegister(CoreRegister.PC, loadAddr + 4 + 1),
    dapWrapper.cortexM.writeCoreRegister(CoreRegister.LR, loadAddr + 1),
    dapWrapper.cortexM.writeCoreRegister(CoreRegister.SP, stackAddr),
    dapWrapper.cortexM.writeCoreRegister(0, page.targetAddr),
    dapWrapper.cortexM.writeCoreRegister(1, addr),
    dapWrapper.cortexM.writeCoreRegister(2, dapWrapper.pageSize >> 2),
  ]);
  return dapWrapper.cortexM.resume(false);
};

const read32FromUInt8Array = (data: Uint8Array, i: number): number => {
  return (
    (data[i] |
      (data[i + 1] << 8) |
      (data[i + 2] << 16) |
      (data[i + 3] << 24)) >>>
    0
  );
};

// Runs the checksum algorithm on the micro:bit's whole flash memory, and returns the results.
// Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L365
const getFlashChecksumsAsync = async (dapWrapper: DAPWrapper) => {
  await dapWrapper.executeAsync(
    loadAddr,
    computeChecksums2,
    stackAddr,
    loadAddr + 1,
    0xffffffff,
    dataAddr,
    0,
    dapWrapper.pageSize,
    dapWrapper.numPages
  );
  return dapWrapper.readBlockAsync(dataAddr, dapWrapper.numPages * 2);
};

/* 
Get MicropythonFsHex that includes: 
1. An copy of the base MicroPython .hex code file,
2. A small header which marks a region as a MicroPython script (followed by the length of the script in bytes),
3. A verbatim copy of user's Python program, complete with comments and any spaces.
*/
const getMicropythonFsHex = async (
  pythonCode: string,
  microBitVersion: MicroBitVersion
) => {
  const microPythonUrl =
    microBitVersion === MicroBitVersion.V1
      ? MICROBIT_MICROPYTHON_V1_URL
      : MICROBIT_MICROPYTHON_V2_URL;
  const microPython = await fetch(microPythonUrl);
  const microPythonHexStr = await microPython.text();

  const commonFsSize = 20 * 1024;
  const microbitFileSystem = new MicropythonFsHex(microPythonHexStr, {
    maxFsSize: commonFsSize,
  });
  microbitFileSystem.write('main.py', pythonCode);
  return microbitFileSystem;
};

export const partialFlashData = async (fs: MicropythonFsHex) => {
  try {
    return fs.getIntelHexBytes();
  } catch (e) {
    console.log(e);
    throw Error('Error in partialFlashData');
  }
};
