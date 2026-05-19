/**
 * Package version. Source of truth is `package.json`; `tsup` replaces the
 * `__SC_VERSION__` identifier with a string literal at build time via the
 * `define` option (see `tsup.config.ts`). In dev/test (vitest loads `.ts`
 * directly without tsup), the identifier is not injected, so we fall back
 * to a placeholder. Tests that need the actual version should read
 * `package.json` directly (see `cli.e2e.test.ts`).
 */
declare const __SC_VERSION__: unknown;

export const VERSION: string =
  typeof __SC_VERSION__ === 'string' ? __SC_VERSION__ : '0.0.0-dev';
