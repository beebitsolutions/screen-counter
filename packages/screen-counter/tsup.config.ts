import { chmod } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { defineConfig } from 'tsup';

// Read the package version once at build time and inject it into every
// build entry as `__SC_VERSION__`. `src/version.ts` reads from this
// identifier so the built bundles always advertise the same version as
// `package.json` (which changesets bumps automatically on release).
const require = createRequire(import.meta.url);
const pkg = require('./package.json') as { version: string };
const versionDefine = { __SC_VERSION__: JSON.stringify(pkg.version) };

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
    define: versionDefine,
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
    define: versionDefine,
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
    define: versionDefine,
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
    define: versionDefine,
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
