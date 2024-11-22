/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {
  IntelHexWithId,
  // getIntelHexAppendedScript,
  // MicropythonFsHex,
} from '@microbit/microbit-fs';

export type MicroPythonSource = () => Promise<IntelHexWithId[]>;
