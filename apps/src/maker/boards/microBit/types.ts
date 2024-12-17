export enum MicroBitVersion {
  V1 = 'v1',
  V2 = 'v2',
}

export class Page {
  constructor(readonly targetAddr: number, readonly data: Uint8Array) {}
}
