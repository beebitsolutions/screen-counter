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
    external: ['react', 'react-dom', '@beebit/screen-counter/badge'],
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
    entry: { badge: 'src/badge/index.tsx' },
    format: ['esm', 'cjs'],
    dts: true,
    sourcemap: true,
    clean: false,
    splitting: false,
    treeshake: false,
    target: 'node20',
    banner: { js: "'use client';" },
    external: ['react', 'react-dom', 'next', '@beebit/screen-counter/runtime'],
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
