import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import type { Config } from '../types.js';

/** File names to probe in the project root, in priority order. */
const CONFIG_FILENAMES = [
  'screen-counter.config.mjs',
  'screen-counter.config.cjs',
  'screen-counter.config.js',
] as const;

/**
 * Resolve and load a `screen-counter.config.{mjs,cjs,js}` from `rootDir`.
 *
 * Returns `undefined` when no config file exists. Throws `TypeError` if a
 * file exists but cannot be loaded or does not default-export a plain object.
 *
 * `.ts` configs are intentionally not supported — that would require an extra
 * runtime dependency (jiti/tsx). Users with TS configs should pre-build to
 * `.mjs`.
 */
export async function loadConfigFile(rootDir: string): Promise<Config | undefined> {
  for (const name of CONFIG_FILENAMES) {
    const abs = path.join(rootDir, name);
    if (!(await fileExists(abs))) continue;

    let mod: unknown;
    try {
      mod = await import(pathToFileURL(abs).href);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new TypeError(`Failed to load ${name}: ${message}`);
    }

    const exported = unwrapDefault(mod);
    if (!isPlainObject(exported)) {
      throw new TypeError(`${name} must default-export a plain object, got ${describe(exported)}.`);
    }
    return exported as Config;
  }
  return undefined;
}

async function fileExists(p: string): Promise<boolean> {
  try {
    const s = await fs.stat(p);
    return s.isFile();
  } catch (err) {
    if (
      typeof err === 'object' &&
      err !== null &&
      'code' in err &&
      (err as { code: unknown }).code === 'ENOENT'
    ) {
      return false;
    }
    throw err;
  }
}

function unwrapDefault(mod: unknown): unknown {
  if (mod && typeof mod === 'object' && 'default' in mod) {
    return (mod as { default: unknown }).default;
  }
  return mod;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  if (v === null || typeof v !== 'object') return false;
  if (Array.isArray(v)) return false;
  const proto = Object.getPrototypeOf(v);
  return proto === Object.prototype || proto === null;
}

function describe(v: unknown): string {
  if (v === null) return 'null';
  if (Array.isArray(v)) return 'array';
  return typeof v;
}
