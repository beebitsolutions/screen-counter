import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { analyze } from './index.js';

let tmpDir = '';

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sc-analyze-'));
});

afterEach(async () => {
  if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true });
});

async function write(rel: string, contents: string): Promise<void> {
  const abs = path.join(tmpDir, rel);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, contents, 'utf8');
}

describe('analyze() — end-to-end smoke on tmp projects', () => {
  it('should count app-router routes and ignore layout/loading/etc.', async () => {
    await write('app/page.tsx', `export default function P(){return <div/>;}`);
    await write('app/about/page.tsx', `export default function P(){return <div/>;}`);
    await write('app/layout.tsx', `export default function L({children}){return children;}`);
    await write('app/loading.tsx', `export default function Loading(){return null;}`);

    const result = await analyze(tmpDir);

    // Sorted by file path, not URL: app/about/page.tsx precedes app/page.tsx.
    expect(result.routes.map((r) => ({ path: r.path, route: r.route }))).toEqual([
      { path: 'app/about/page.tsx', route: '/about' },
      { path: 'app/page.tsx', route: '/' },
    ]);
    expect(result.count).toBe(2);
    expect(result.modals).toEqual([]);
    expect(result.disabled).toEqual([]);
  });

  it('should detect a Radix Dialog component as a modal', async () => {
    await write('app/page.tsx', `export default function P(){return <div/>;}`);
    await write(
      'components/LoginModal.tsx',
      `
        import * as Dialog from '@radix-ui/react-dialog';
        export default function LoginModal(){ return <Dialog.Root>x</Dialog.Root>; }
      `,
    );

    const result = await analyze(tmpDir);
    expect(result.modals).toHaveLength(1);
    expect(result.modals[0]?.path).toBe('components/LoginModal.tsx');
    expect(result.modals[0]?.signals.some((s) => s.rule === 'import:@radix-ui/react-dialog')).toBe(
      true,
    );
    expect(result.count).toBe(2);
  });

  it('should hard-exclude components with a Provider suffix even with strong signals', async () => {
    await write(
      'components/LoginModalProvider.tsx',
      `
        import * as Dialog from '@radix-ui/react-dialog';
        export default function LoginModalProvider({children}){ return <Dialog.Root>{children}</Dialog.Root>; }
      `,
    );
    const result = await analyze(tmpDir);
    expect(result.modals).toEqual([]);
    expect(result.disabled).toEqual([]);
  });

  it('should respect data-screen-counter="disable" — entry lives in disabled, not modals', async () => {
    await write(
      'components/ForcedExclude.tsx',
      `
        import * as Dialog from '@radix-ui/react-dialog';
        export default function ForcedExclude(){ return <div data-screen-counter="disable"><Dialog.Root/></div>; }
      `,
    );
    const result = await analyze(tmpDir);
    expect(result.modals).toEqual([]);
    expect(result.disabled).toHaveLength(1);
    expect(result.disabled[0]?.kind).toBe('disabled');
    expect(result.disabled[0]?.signals[0]?.rule).toBe('escape-hatch:disable');
  });

  it('should classify data-screen-counter="screen" as forced', async () => {
    await write(
      'components/ForcedInclude.tsx',
      `
        export default function ForcedInclude(){ return <div data-screen-counter="screen">plain</div>; }
      `,
    );
    const result = await analyze(tmpDir);
    expect(result.modals).toHaveLength(1);
    expect(result.modals[0]?.kind).toBe('forced');
    expect(result.modals[0]?.signals[0]?.rule).toBe('escape-hatch:screen');
  });

  it('should be deterministic — two analyze() runs return identical JSON', async () => {
    await write('app/page.tsx', `export default function P(){return <div/>;}`);
    await write('app/users/[id]/page.tsx', `export default function P(){return <div/>;}`);
    await write(
      'components/Foo.tsx',
      `import { Drawer } from '@mui/material'; export default function Foo(){return <Drawer/>;}`,
    );

    const a = await analyze(tmpDir);
    const b = await analyze(tmpDir);
    expect(JSON.stringify(b)).toBe(JSON.stringify(a));
  });

  it('should throw a friendly error when rootDir does not exist', async () => {
    await expect(analyze(path.join(tmpDir, 'nope'))).rejects.toThrow(/rootDir does not exist/);
  });

  it('should throw when rootDir is a file, not a directory', async () => {
    const file = path.join(tmpDir, 'a-file.txt');
    await fs.writeFile(file, 'x', 'utf8');
    await expect(analyze(file)).rejects.toThrow(/not a directory/);
  });

  it('should reject invalid config with TypeError', async () => {
    await expect(
      analyze(tmpDir, { scoringThreshold: { strong: 0, weak: 1 } } as never),
    ).rejects.toBeInstanceOf(TypeError);
  });

  it('should emit a warning for parallel routes and skip them', async () => {
    await write('app/page.tsx', `export default function P(){return <div/>;}`);
    await write('app/@modal/page.tsx', `export default function P(){return <div/>;}`);

    const result = await analyze(tmpDir);
    expect(result.routes.map((r) => r.path)).toEqual(['app/page.tsx']);
    expect(result.warnings).toBeDefined();
    expect(result.warnings?.some((w) => /Parallel route/.test(w))).toBe(true);
  });
});
