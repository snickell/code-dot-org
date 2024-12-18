// Copied from https://github.com/microbit-foundation/python-editor-v3/blob/main/src/device/constants.ts

// FICR Registers
export const FICR = {
  CODEPAGESIZE: 0x10000000 | 0x10,
  CODESIZE: 0x10000000 | 0x14,
};

export const DapCmd = {
  DAP_INFO: 0x00,
  DAP_CONNECT: 0x02,
  DAP_DISCONNECT: 0x03,
  DAP_TRANSFER: 0x05,
  DAP_TRANSFER_BLOCK: 0x06,
  // Many more.
};

export const Csw = {
  CSW_SIZE: 0x00000007,
  CSW_SIZE32: 0x00000002,
  CSW_ADDRINC: 0x00000030,
  CSW_SADDRINC: 0x00000010,
  CSW_DBGSTAT: 0x00000040,
  CSW_HPROT: 0x02000000,
  CSW_MSTRDBG: 0x20000000,
  CSW_RESERVED: 0x01000000,
  CSW_VALUE: -1, // see below
  // Many more.
};

export const DapVal = {
  AP_ACC: 1 << 0,
  READ: 1 << 1,
  WRITE: 0 << 1,
  // More.
};

export const ApReg = {
  CSW: 0x00,
  TAR: 0x04,
  DRW: 0x0c,
  // More.
};

export const CortexSpecialReg = {
  // Debug Exception and Monitor Control Register
  DEMCR: 0xe000edfc,
  // DWTENA in armv6 architecture reference manual
  DEMCR_VC_CORERESET: 1 << 0,

  // CPUID Register
  CPUID: 0xe000ed00,

  // Debug Halting Control and Status Register
  DHCSR: 0xe000edf0,
  S_RESET_ST: 1 << 25,

  NVIC_AIRCR: 0xe000ed0c,
  NVIC_AIRCR_VECTKEY: 0x5fa << 16,
  NVIC_AIRCR_SYSRESETREQ: 1 << 2,

  // Many more.
};

export const membase = 0x20000000;
export const loadAddr = membase;
export const dataAddr = 0x20002000;
export const stackAddr = 0x20001000;

// void computeHashes(uint32_t *dst, uint8_t *ptr, uint32_t pageSize, uint32_t numPages)
// Drawn from https://github.com/microsoft/pxt-microbit/blob/dec5b8ce72d5c2b4b0b20aafefce7474a6f0c7b2/editor/extension.tsx#L253
// prettier-ignore
export const computeChecksums2 = new Uint32Array([
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
export const flashPageBIN = new Uint32Array([
  0xbe00be00, // bkpt - LR is set to this
  0x2502b5f0, 0x4c204b1f, 0xf3bf511d, 0xf3bf8f6f, 0x25808f4f, 0x002e00ed,
  0x2f00595f, 0x25a1d0fc, 0x515800ed, 0x2d00599d, 0x2500d0fc, 0xf3bf511d,
  0xf3bf8f6f, 0x25808f4f, 0x002e00ed, 0x2f00595f, 0x2501d0fc, 0xf3bf511d,
  0xf3bf8f6f, 0x599d8f4f, 0xd0fc2d00, 0x25002680, 0x00f60092, 0xd1094295,
  0x511a2200, 0x8f6ff3bf, 0x8f4ff3bf, 0x2a00599a, 0xbdf0d0fc, 0x5147594f,
  0x2f00599f, 0x3504d0fc, 0x46c0e7ec, 0x4001e000, 0x00000504,
]);
