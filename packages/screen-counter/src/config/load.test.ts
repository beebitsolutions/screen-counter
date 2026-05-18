import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { loadConfigFile } from './load.js';

let tmpDir = '';

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sc-config-'));
});

afterEach(async () => {
  if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true });
});

describe('loadConfigFile', () => {
  it('should return undefined when no config file exists', async () => {
    expect(await loadConfigFile(tmpDir)).toBeUndefined();
  });

  it('should load screen-counter.config.mjs and return the default export', async () => {
    await fs.writeFile(
      path.join(tmpDir, 'screen-counter.config.mjs'),
      `export default { pagesRouter: true };`,
      'utf8',
    );
    const config = await loadConfigFile(tmpDir);
    expect(config).toEqual({ pagesRouter: true });
  });

  it('should prefer .mjs over .cjs when both exist', async () => {
    await fs.writeFile(
      path.join(tmpDir, 'screen-counter.config.mjs'),
      `export default { include: ['mjs'] };`,
      'utf8',
    );
    await fs.writeFile(
      path.join(tmpDir, 'screen-counter.config.cjs'),
      `module.exports = { include: ['cjs'] };`,
      'utf8',
    );
    const config = await loadConfigFile(tmpDir);
    expect(config).toEqual({ include: ['mjs'] });
  });

  it('should throw TypeError when the file does not default-export an object', async () => {
    await fs.writeFile(
      path.join(tmpDir, 'screen-counter.config.mjs'),
      `export default 42;`,
      'utf8',
    );
    await expect(loadConfigFile(tmpDir)).rejects.toBeInstanceOf(TypeError);
  });

  it('should throw TypeError when the default export is an array', async () => {
    await fs.writeFile(
      path.join(tmpDir, 'screen-counter.config.mjs'),
      `export default ['oops'];`,
      'utf8',
    );
    await expect(loadConfigFile(tmpDir)).rejects.toThrow(/must default-export a plain object/);
  });

  it('should throw TypeError when the file fails to import (syntax error)', async () => {
    await fs.writeFile(
      path.join(tmpDir, 'screen-counter.config.mjs'),
      `export default {`, // broken
      'utf8',
    );
    await expect(loadConfigFile(tmpDir)).rejects.toBeInstanceOf(TypeError);
  });
});
