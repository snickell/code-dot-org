import {defineConfig} from "tsup";
import { sassPlugin } from 'esbuild-sass-plugin';
import * as path from "node:path";

export default defineConfig({
  clean: true,
  target: "es2019",
  format: ["cjs", "esm"],
  banner: {js: '"use client";'},
  esbuildPlugins: [
    sassPlugin({
      includePaths: ["."],
    })
  ]
});
