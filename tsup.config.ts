import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  dts: true,
  clean: true,
  format: ['cjs'],
  treeshake: true,
  minify: false,
  sourcemap: false,
});
