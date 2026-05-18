import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_EXCLUDES, discoverFiles, loadGitignore } from './discover.js';

let tmpDir = '';

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sc-discover-'));
});

afterEach(async () => {
  if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true });
});

async function touch(rel: string, contents = ''): Promise<void> {
  const abs = path.join(tmpDir, rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, contents, 'utf8');
}

describe('discoverFiles — app/ patterns', () => {
  it('should detect page.tsx and ignore other special files in the same folder', async () => {
    await touch('app/page.tsx');
    await touch('app/layout.tsx');
    await touch('app/loading.tsx');
    await touch('app/error.tsx');
    await touch('app/not-found.tsx');
    await touch('app/template.tsx');
    await touch('app/default.tsx');
    await touch('app/route.ts');

    const files = await discoverFiles({
      rootDir: tmpDir,
      patterns: ['app/**/page.{tsx,jsx,ts,js}'],
      extraExcludes: [],
      gitignore: null,
    });

    expect(files).toEqual(['app/page.tsx']);
  });

  it('should detect dynamic-segment routes and sort lexicographically', async () => {
    await touch('app/users/[id]/page.tsx');
    await touch('app/blog/[...slug]/page.tsx');
    await touch('app/docs/[[...slug]]/page.tsx');

    const files = await discoverFiles({
      rootDir: tmpDir,
      patterns: ['app/**/page.{tsx,jsx,ts,js}'],
      extraExcludes: [],
      gitignore: null,
    });

    expect(files).toEqual([
      'app/blog/[...slug]/page.tsx',
      'app/docs/[[...slug]]/page.tsx',
      'app/users/[id]/page.tsx',
    ]);
  });

  it('should detect pages inside route-group folders', async () => {
    await touch('app/(marketing)/landing/page.tsx');
    await touch('app/(marketing)/contact/page.tsx');

    const files = await discoverFiles({
      rootDir: tmpDir,
      patterns: ['app/**/page.{tsx,jsx,ts,js}'],
      extraExcludes: [],
      gitignore: null,
    });

    expect(files).toEqual([
      'app/(marketing)/contact/page.tsx',
      'app/(marketing)/landing/page.tsx',
    ]);
  });

  it('should exclude node_modules, .next, dist via DEFAULT_EXCLUDES', async () => {
    await touch('app/page.tsx');
    await touch('node_modules/foo/page.tsx');
    await touch('.next/server/page.tsx');
    await touch('dist/output/page.tsx');

    const files = await discoverFiles({
      rootDir: tmpDir,
      patterns: ['**/page.{tsx,jsx,ts,js}'],
      extraExcludes: [],
      gitignore: null,
    });

    expect(files).toEqual(['app/page.tsx']);
  });

  it('should respect a .gitignore matcher loaded by loadGitignore', async () => {
    await touch('app/page.tsx');
    await touch('private/page.tsx');
    await touch('.gitignore', 'private/\n');

    const gi = await loadGitignore(tmpDir);
    expect(gi).not.toBeNull();

    const files = await discoverFiles({
      rootDir: tmpDir,
      patterns: ['**/page.{tsx,jsx,ts,js}'],
      extraExcludes: [],
      gitignore: gi,
    });
    expect(files).toEqual(['app/page.tsx']);
  });

  it('should return null from loadGitignore when no .gitignore file exists', async () => {
    expect(await loadGitignore(tmpDir)).toBeNull();
  });

  it('should be deterministic — running twice on the same tree returns identical output', async () => {
    await touch('app/page.tsx');
    await touch('app/about/page.tsx');
    await touch('app/users/[id]/page.tsx');

    const opts = {
      rootDir: tmpDir,
      patterns: ['app/**/page.{tsx,jsx,ts,js}'],
      extraExcludes: [],
      gitignore: null,
    };
    const first = await discoverFiles(opts);
    const second = await discoverFiles(opts);
    expect(second).toEqual(first);
  });

  it('should let consumer-supplied extraExcludes hide files', async () => {
    await touch('app/page.tsx');
    await touch('app/secret/page.tsx');

    const files = await discoverFiles({
      rootDir: tmpDir,
      patterns: ['app/**/page.{tsx,jsx,ts,js}'],
      extraExcludes: ['**/secret/**'],
      gitignore: null,
    });

    expect(files).toEqual(['app/page.tsx']);
  });

  it('DEFAULT_EXCLUDES should mention each forbidden directory', () => {
    expect(DEFAULT_EXCLUDES).toContain('**/node_modules/**');
    expect(DEFAULT_EXCLUDES).toContain('**/.next/**');
    expect(DEFAULT_EXCLUDES).toContain('**/dist/**');
  });
});
