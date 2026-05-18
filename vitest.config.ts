import { defineConfig } from 'vitest/config';

const reporters = process.env['CI'] ? ['default', 'json'] : ['default'];

export default defineConfig({
  test: {
    globals: false,
    include: ['packages/**/src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/.next/**'],
    reporters,
    testTimeout: 10_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary'],
      include: ['packages/screen-counter/src/**/*.{ts,tsx}'],
      exclude: [
        'packages/screen-counter/src/**/*.test.ts',
        'packages/screen-counter/src/**/*.d.ts',
        'packages/screen-counter/src/**/__test-helpers__/**',
        'packages/screen-counter/src/badge/**',
        'packages/screen-counter/src/plugin/**',
        'packages/screen-counter/src/runtime/**',
        'packages/screen-counter/src/types.ts',
        'packages/screen-counter/src/version.ts',
        'packages/screen-counter/src/index.ts',
        // The binary entrypoint and watch loop are exercised via CLI E2E tests
        // (spawned subprocess — v8 coverage does not cross the process boundary).
        'packages/screen-counter/src/cli/index.ts',
        'packages/screen-counter/src/cli/watch.ts',
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
        'packages/screen-counter/src/analyzer/routes/**/*.ts': {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
      },
    },
  },
});
