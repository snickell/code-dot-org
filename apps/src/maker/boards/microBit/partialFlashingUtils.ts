/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  DapVal,
  loadAddr,
  dataAddr,
  stackAddr,
  computeChecksums2,
} from './constants';
import {DAPWrapper} from './DapWrapper';
import {Page} from './types';

// Represents the micro:bit's core registers
// Drawn from https://armmbed.github.io/dapjs/docs/enums/coreregister.html
export const CoreRegister = {
  SP: 13,
  LR: 14,
  PC: 15,
};

export const read32FromUInt8Array = (data: Uint8Array, i: number): number => {
  return (
    (data[i] |
      (data[i + 1] << 8) |
      (data[i + 2] << 16) |
      (data[i + 3] << 24)) >>>
    0
  );
};

export const bufferConcat = (bufs: Uint8Array[]): Uint8Array => {
  let len = 0;
  for (const b of bufs) {
    len += b.length;
  }
  const r = new Uint8Array(len);
  len = 0;
  for (const b of bufs) {
    r.set(b, len);
    len += b.length;
  }
  return r;
};

// Returns the MurmurHash of the data passed to it, used for checksum calculation.
// Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L14
export const murmur3_core = (data: Uint8Array): [number, number] => {
  let h0 = 0x2f9be6cc;
  let h1 = 0x1ec3a6c8;

  for (let i = 0; i < data.byteLength; i += 4) {
    let k = read32FromUInt8Array(data, i) >>> 0;
    k = Math.imul(k, 0xcc9e2d51);
    k = (k << 15) | (k >>> 17);
    k = Math.imul(k, 0x1b873593);

    h0 ^= k;
    h1 ^= k;
    h0 = (h0 << 13) | (h0 >>> 19);
    h1 = (h1 << 13) | (h1 >>> 19);
    h0 = (Math.imul(h0, 5) + 0xe6546b64) >>> 0;
    h1 = (Math.imul(h1, 5) + 0xe6546b64) >>> 0;
  }
  return [h0, h1];
};

// Returns a representation of an Access Port Register.
// Drawn from https://github.com/mmoskal/dapjs/blob/a32f11f54e9e76a9c61896ddd425c1cb1a29c143/src/util.ts#L63
export const apReg = (r: number, mode: number): number /* Reg */ => {
  const v = r | mode | DapVal.AP_ACC;
  return 4 + ((v & 0x0c) >> 2);
};

// Returns a code representing a request to read/write a certain register.
// Drawn from https://github.com/mmoskal/dapjs/blob/a32f11f54e9e76a9c61896ddd425c1cb1a29c143/src/util.ts#L92
export const regRequest = (regId: number, isWrite: boolean = false): number => {
  let request = !isWrite ? 1 << 1 /* READ */ : 0 << 1; /* WRITE */

  if (regId < 4) {
    request |= 0 << 0 /* DP_ACC */;
  } else {
    request |= 1 << 0 /* AP_ACC */;
  }

  request |= (regId & 3) << 2;

  return request;
};

// Split buffer into pages, each of pageSize size.
// Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L209
export const pageAlignBlocks = (
  buffer: Uint8Array,
  targetAddr: number,
  pageSize: number
): Page[] => {
  const unaligned = new Uint8Array(buffer);
  const pages = [];
  for (let i = 0; i < unaligned.byteLength; ) {
    const newbuf = new Uint8Array(pageSize).fill(0xff);
    const startPad = (targetAddr + i) & (pageSize - 1);
    const newAddr = targetAddr + i - startPad;
    for (; i < unaligned.byteLength; ++i) {
      if (targetAddr + i >= newAddr + pageSize) break;
      newbuf[targetAddr + i - newAddr] = unaligned[i];
    }
    const page = new Page(newAddr, newbuf);
    pages.push(page);
  }
  return pages;
};

// Filter out all pages whose calculated checksum matches the corresponding checksum passed as an argument.
// Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L523
export const onlyChanged = (
  pages: Page[],
  checksums: Uint8Array,
  pageSize: number
): Page[] => {
  return pages.filter(page => {
    const idx = page.targetAddr / pageSize;
    if (idx * 8 + 8 > checksums.length) return true; // out of range?
    const c0 = read32FromUInt8Array(checksums, idx * 8);
    const c1 = read32FromUInt8Array(checksums, idx * 8 + 4);
    const ch = murmur3_core(page.data);
    if (c0 === ch[0] && c1 === ch[1]) return false;
    return true;
  });
};

export const partialFlashPageAsync = async (
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

export const runFlash = async (
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

// Runs the checksum algorithm on the micro:bit's whole flash memory, and returns the results.
// Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L365
export const getFlashChecksumsAsync = async (dapWrapper: DAPWrapper) => {
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

// Write pages of data to micro:bit ROM.
export const partialFlashCoreAsync = async (
  dapWrapper: DAPWrapper,
  pages: Page[]
) => {
  for (let i = 0; i < pages.length; ++i) {
    console.log(`page ${i + 1} out of ${pages.length}`);
    await partialFlashPageAsync(dapWrapper, pages[i], pages[i + 1], i);
  }
  console.log('FLASH COMPLETE');
};
