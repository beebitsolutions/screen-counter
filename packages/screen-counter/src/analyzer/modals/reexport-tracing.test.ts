import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { analyze } from '../index.js';
import type { Signal } from '../../types.js';
import type { ImportInfo } from './parse.js';
import { createPathResolver } from './path-resolver.js';
import {
  buildModalSourceSet,
  detectReexportSignal,
  hasPropagationSourceSignal,
} from './reexport-tracing.js';

const tempRoots: string[] = [];

function makeTempRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'screen-counter-reexport-'));
  tempRoots.push(root);
  return root;
}

function writeFile(absPath: string, contents: string): void {
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, contents, 'utf8');
}

afterEach(() => {
  while (tempRoots.length > 0) {
    const root = tempRoots.pop()!;
    fs.rmSync(root, { recursive: true, force: true });
  }
});

const strong = (rule: string): Signal => ({ kind: 'strong', rule });
const weak = (rule: string): Signal => ({ kind: 'weak', rule });

describe('buildModalSourceSet()', () => {
  it('includes files with path:shadcn-ui', () => {
    const set = buildModalSourceSet([
      { filePath: 'components/ui/dialog.tsx', signals: [strong('path:shadcn-ui')] },
      { filePath: 'components/Other.tsx', signals: [weak('name-suffix:Modal')] },
    ]);
    expect([...set]).toEqual(['components/ui/dialog.tsx']);
  });

  it('does NOT include files whose only strong signal is an import:<modal-lib>', () => {
    // Application-level modals (DeleteProjectDialog, etc.) commonly import
    // Radix/MUI/etc. directly. If they were propagation sources, every
    // component that *renders* them (a row of a table, a page shell) would
    // inherit a strong signal — conflating "uses a modal" with "is a modal".
    const set = buildModalSourceSet([
      {
        filePath: 'components/DeleteProjectDialog.tsx',
        signals: [strong('import:@radix-ui/react-dialog')],
      },
      {
        filePath: 'components/Drawer.tsx',
        signals: [strong('import:vaul')],
      },
    ]);
    expect(set.size).toBe(0);
  });

  it('does NOT include files whose only strong signal is jsx-attr:*', () => {
    const set = buildModalSourceSet([
      {
        filePath: 'components/HandRolledModal.tsx',
        signals: [strong('jsx-attr:role=dialog'), weak('name-suffix:Modal')],
      },
    ]);
    expect(set.size).toBe(0);
  });

  it('includes a shadcn primitive that ALSO imports a modal library', () => {
    // The shadcn `components/ui/dialog.tsx` typically imports Radix. Path
    // signal alone is enough; combined signals do not double-count.
    const set = buildModalSourceSet([
      {
        filePath: 'components/ui/dialog.tsx',
        signals: [strong('path:shadcn-ui'), strong('import:@radix-ui/react-dialog')],
      },
    ]);
    expect([...set]).toEqual(['components/ui/dialog.tsx']);
  });

  it('returns an empty set for candidates with only weak signals', () => {
    const set = buildModalSourceSet([
      { filePath: 'components/X.tsx', signals: [weak('name-suffix:Modal')] },
    ]);
    expect(set.size).toBe(0);
  });
});

describe('detectReexportSignal()', () => {
  it('emits a strong signal when a consumer imports from a source via @/* alias', () => {
    const root = makeTempRoot();
    writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { paths: { '@/*': ['./*'] } } }),
    );
    writeFile(path.join(root, 'components/ui/dialog.tsx'), 'export const Dialog = () => null;');
    const resolver = createPathResolver(root);
    const sourceSet = new Set(['components/ui/dialog.tsx']);
    const imports: ImportInfo[] = [
      {
        source: '@/components/ui/dialog',
        specifiers: [{ imported: 'Dialog', local: 'Dialog' }],
      },
    ];
    expect(detectReexportSignal('components/Consumer.tsx', imports, sourceSet, resolver)).toEqual({
      kind: 'strong',
      rule: 'reexport:components/ui/dialog.tsx',
    });
  });

  it('emits a strong signal for a relative ./ui/dialog import', () => {
    const root = makeTempRoot();
    writeFile(path.join(root, 'components/ui/dialog.tsx'), 'export const Dialog = () => null;');
    const resolver = createPathResolver(root);
    const sourceSet = new Set(['components/ui/dialog.tsx']);
    const imports: ImportInfo[] = [
      { source: './ui/dialog', specifiers: [{ imported: 'Dialog', local: 'Dialog' }] },
    ];
    expect(
      detectReexportSignal('components/Consumer.tsx', imports, sourceSet, resolver),
    ).toEqual({ kind: 'strong', rule: 'reexport:components/ui/dialog.tsx' });
  });

  it('emits a strong signal for an upward relative ../../components/ui/drawer import', () => {
    const root = makeTempRoot();
    writeFile(path.join(root, 'components/ui/drawer.tsx'), 'export const Drawer = () => null;');
    writeFile(path.join(root, 'features/billing/Consumer.tsx'), '');
    const resolver = createPathResolver(root);
    const sourceSet = new Set(['components/ui/drawer.tsx']);
    const imports: ImportInfo[] = [
      {
        source: '../../components/ui/drawer',
        specifiers: [{ imported: 'Drawer', local: 'Drawer' }],
      },
    ];
    expect(
      detectReexportSignal('features/billing/Consumer.tsx', imports, sourceSet, resolver),
    ).toEqual({ kind: 'strong', rule: 'reexport:components/ui/drawer.tsx' });
  });

  it('does NOT emit when imports resolve outside the source set', () => {
    const root = makeTempRoot();
    writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { paths: { '@/*': ['./*'] } } }),
    );
    writeFile(path.join(root, 'lib/utils.ts'), 'export const cn = () => "";');
    const resolver = createPathResolver(root);
    const sourceSet = new Set(['components/ui/dialog.tsx']);
    const imports: ImportInfo[] = [
      { source: '@/lib/utils', specifiers: [{ imported: 'cn', local: 'cn' }] },
    ];
    expect(
      detectReexportSignal('components/Consumer.tsx', imports, sourceSet, resolver),
    ).toBeNull();
  });

  it('returns null when the consumer has no imports', () => {
    const root = makeTempRoot();
    const resolver = createPathResolver(root);
    expect(detectReexportSignal('components/Consumer.tsx', [], new Set(['anything']), resolver))
      .toBeNull();
  });

  it('picks the first import-order match when multiple imports resolve to source files', () => {
    const root = makeTempRoot();
    writeFile(path.join(root, 'components/ui/dialog.tsx'), '');
    writeFile(path.join(root, 'components/ui/drawer.tsx'), '');
    const resolver = createPathResolver(root);
    const sourceSet = new Set(['components/ui/dialog.tsx', 'components/ui/drawer.tsx']);
    const imports: ImportInfo[] = [
      { source: './ui/drawer', specifiers: [{ imported: 'Drawer', local: 'Drawer' }] },
      { source: './ui/dialog', specifiers: [{ imported: 'Dialog', local: 'Dialog' }] },
    ];
    expect(
      detectReexportSignal('components/Consumer.tsx', imports, sourceSet, resolver),
    ).toEqual({ kind: 'strong', rule: 'reexport:components/ui/drawer.tsx' });
  });
});

describe('hasPropagationSourceSignal()', () => {
  it('returns true for path:shadcn-ui', () => {
    expect(hasPropagationSourceSignal([strong('path:shadcn-ui')])).toBe(true);
  });

  it('returns false for import:* alone', () => {
    expect(hasPropagationSourceSignal([strong('import:@radix-ui/react-dialog')])).toBe(false);
  });

  it('returns false for jsx-attr:* only', () => {
    expect(hasPropagationSourceSignal([strong('jsx-attr:role=dialog')])).toBe(false);
  });

  it('returns false for weak signals only', () => {
    expect(hasPropagationSourceSignal([weak('name-suffix:Modal')])).toBe(false);
  });
});

describe('synthetic E2E — analyze() against a shadcn-style fixture', () => {
  it('detects the consumer of a local @/components/ui/dialog primitive', async () => {
    const root = makeTempRoot();
    writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { paths: { '@/*': ['./*'] } } }, null, 2),
    );
    // Route.
    writeFile(
      path.join(root, 'app/page.tsx'),
      `export default function Page() { return <div>home</div>; }\n`,
    );
    // Primitive: path:shadcn-ui + aria-modal="true" on the JSX root.
    writeFile(
      path.join(root, 'components/ui/dialog.tsx'),
      `export default function Dialog() {\n  return <div role="dialog" aria-modal="true">x</div>;\n}\n`,
    );
    // Consumer (PascalCase, no naming signal): imports the primitive via alias.
    writeFile(
      path.join(root, 'components/AddStockModal.tsx'),
      `import { Dialog } from '@/components/ui/dialog';\nexport default function AddStockModal() {\n  return <Dialog />;\n}\n`,
    );

    const result = await analyze(root);
    expect(result.count).toBe(3);
    expect(result.routes.map((r) => r.path)).toEqual(['app/page.tsx']);
    const modalPaths = result.modals.map((m) => m.path).sort();
    expect(modalPaths).toEqual([
      'components/AddStockModal.tsx',
      'components/ui/dialog.tsx',
    ]);
    const consumer = result.modals.find((m) => m.path === 'components/AddStockModal.tsx')!;
    expect(consumer.signals).toContainEqual({
      kind: 'strong',
      rule: 'reexport:components/ui/dialog.tsx',
    });
  });
});

describe('orchestration — no double-counting', () => {
  it('does NOT add a reexport signal on a candidate that already has a propagation-source signal', async () => {
    // The primitive itself imports from @radix-ui/react-dialog AND lives at
    // components/ui/dialog.tsx. The second pass should leave its signals
    // alone (no `reexport:components/ui/dialog.tsx` self-loop) and must not
    // add `reexport:components/ui/dialog.tsx` on itself.
    const root = makeTempRoot();
    writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { paths: { '@/*': ['./*'] } } }, null, 2),
    );
    writeFile(
      path.join(root, 'app/page.tsx'),
      `export default function Page() { return <div>home</div>; }\n`,
    );
    writeFile(
      path.join(root, 'components/ui/dialog.tsx'),
      `import * as Dialog from '@radix-ui/react-dialog';\nexport default function D() { return <Dialog.Root />; }\n`,
    );

    const result = await analyze(root);
    const primitive = result.modals.find((m) => m.path === 'components/ui/dialog.tsx')!;
    const reexportSelfLoops = primitive.signals.filter((s) =>
      s.rule.startsWith('reexport:'),
    );
    expect(reexportSelfLoops).toEqual([]);
  });
});
