/**
 * (c) 2021, Micro:bit Educational Foundation and contributors
 *
 * SPDX-License-Identifier: MIT
 */
import {IntelHexWithId} from '@microbit/microbit-fs';

export type MicroPythonSource = () => Promise<IntelHexWithId[]>;
