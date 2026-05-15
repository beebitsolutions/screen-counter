import { chmod } from 'node:fs/promises';
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: true,
    splitting: false,
    treeshake: true,
    target: 'node20',
  },
  {
    entry: { cli: 'src/cli/index.ts' },
    format: ['esm'],
    dts: false,
    sourcemap: true,
    clean: false,
    splitting: false,
    treeshake: true,
    target: 'node20',
    banner: { js: '#!/usr/bin/env node' },
    onSuccess: async () => {
      await chmod('dist/cli.js', 0o755).catch(() => {});
    },
  },
  {
    entry: {
      plugin: 'src/plugin/index.ts',
      runtime: 'src/runtime/index.ts',
      badge: 'src/badge/index.ts',
    },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: false,
    splitting: false,
    treeshake: true,
    target: 'node20',
    external: ['next', 'react', 'react-dom', 'webpack'],
  },
  {
    entry: { 'plugin/inject-loader': 'src/plugin/inject-loader.cjs' },
    format: ['cjs'],
    outExtension: () => ({ js: '.cjs' }),
    dts: false,
    sourcemap: true,
    clean: false,
    splitting: false,
    treeshake: false,
    target: 'node20',
  },
]);
