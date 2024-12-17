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

import {DAPWrapper} from './dap-wrapper';
import {
  onlyChanged,
  pageAlignBlocks,
  CoreRegister,
} from './partial-flashing-utils';

const membase = 0x20000000;
const loadAddr = membase;
const dataAddr = 0x20002000;
const stackAddr = 0x20001000;

// void computeHashes(uint32_t *dst, uint8_t *ptr, uint32_t pageSize, uint32_t numPages)
// Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L253
// prettier-ignore
const computeChecksums2 = new Uint32Array([
0x4c27b5f0, 0x44a52680, 0x22009201, 0x91004f25, 0x00769303, 0x24080013,
0x25010019, 0x40eb4029, 0xd0002900, 0x3c01407b, 0xd1f52c00, 0x468c0091,
0xa9044665, 0x506b3201, 0xd1eb42b2, 0x089b9b01, 0x23139302, 0x9b03469c,
0xd104429c, 0x2000be2a, 0x449d4b15, 0x9f00bdf0, 0x4d149e02, 0x49154a14,
0x3e01cf08, 0x2111434b, 0x491341cb, 0x405a434b, 0x4663405d, 0x230541da,
0x4b10435a, 0x466318d2, 0x230541dd, 0x4b0d435d, 0x2e0018ed, 0x6002d1e7,
0x9a009b01, 0x18d36045, 0x93003008, 0xe7d23401, 0xfffffbec, 0xedb88320,
0x00000414, 0x1ec3a6c8, 0x2f9be6cc, 0xcc9e2d51, 0x1b873593, 0xe6546b64,
]);

// Source code for binaries in can be found at https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/external/sha/source/main.c
// Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L243
// Update from https://github.com/microsoft/pxt-microbit/commit/a35057717222b8e48335144f497b55e29e9b0f25
// prettier-ignore
const flashPageBIN = new Uint32Array([
  0xbe00be00, // bkpt - LR is set to this
  0x2502b5f0, 0x4c204b1f, 0xf3bf511d, 0xf3bf8f6f, 0x25808f4f, 0x002e00ed,
  0x2f00595f, 0x25a1d0fc, 0x515800ed, 0x2d00599d, 0x2500d0fc, 0xf3bf511d,
  0xf3bf8f6f, 0x25808f4f, 0x002e00ed, 0x2f00595f, 0x2501d0fc, 0xf3bf511d,
  0xf3bf8f6f, 0x599d8f4f, 0xd0fc2d00, 0x25002680, 0x00f60092, 0xd1094295,
  0x511a2200, 0x8f6ff3bf, 0x8f4ff3bf, 0x2a00599a, 0xbdf0d0fc, 0x5147594f,
  0x2f00599f, 0x3504d0fc, 0x46c0e7ec, 0x4001e000, 0x00000504,
]);

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
  let partial: boolean | undefined;
  if (aligned.length > totalPages / 2) {
    try {
      console.log('full flash');
      await flashHexString(hexStrWithFiles, device);
      partial = false;
    } catch (error) {
      console.log(error);
      return Promise.reject('Failed to send MicroPython program to micro:bit.');
    }
  } else {
    console.log('partial flash');
    try {
      await partialFlashCoreAsync(dapWrapper, aligned);
      partial = true;
    } catch (e) {
      console.log(e);
      console.log('Partial flash failed, attempting full flash.');
      await flashHexString(hexStrWithFiles, device);
      partial = false;
    }
  }
  console.log('partial', partial);
};

class Page {
  constructor(readonly targetAddr: number, readonly data: Uint8Array) {}
}

// Write pages of data to micro:bit ROM.
const partialFlashCoreAsync = async (dapWrapper: DAPWrapper, pages: Page[]) => {
  console.log('Partial flash');
  for (let i = 0; i < pages.length; ++i) {
    console.log('page i', i);
    await partialFlashPageAsync(dapWrapper, pages[i], pages[i + 1], i);
  }
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

  console.log('partialFlashPageAsync');
  // Use two slots in RAM to allow parallelisation of the following two tasks.
  // 1. DAPjs writes a page to one slot.
  // 2. flashPageBIN copies a page to flash from the other slot.
  const thisAddr = i & 1 ? dataAddr : dataAddr + dapWrapper.pageSize;
  const nextAddr = i & 1 ? dataAddr + dapWrapper.pageSize : dataAddr;

  // Write first page to slot in RAM.
  // All subsequent pages will have already been written to RAM.
  if (i === 0) {
    console.log('i', i);
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
