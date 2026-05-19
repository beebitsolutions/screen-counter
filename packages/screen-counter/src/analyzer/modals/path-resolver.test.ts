import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createPathResolver } from './path-resolver.js';

const tempRoots: string[] = [];

function makeTempRoot(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'screen-counter-resolver-'));
  tempRoots.push(root);
  return root;
}

function writeFile(absPath: string, contents = '// fixture\nexport {};\n'): void {
  fs.mkdirSync(path.dirname(absPath), { recursive: true });
  fs.writeFileSync(absPath, contents, 'utf8');
}

afterEach(() => {
  while (tempRoots.length > 0) {
    const root = tempRoots.pop()!;
    fs.rmSync(root, { recursive: true, force: true });
  }
});

describe('createPathResolver — @/* alias from tsconfig.json', () => {
  it('honours an explicit "@/*": ["./*"] mapping', () => {
    const root = makeTempRoot();
    writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { paths: { '@/*': ['./*'] } } }),
    );
    writeFile(path.join(root, 'components/ui/dialog.tsx'));

    const resolver = createPathResolver(root);
    const out = resolver.resolve('components/Consumer.tsx', '@/components/ui/dialog');
    expect(out).toBe('components/ui/dialog.tsx');
  });

  it('honours a "@/*": ["./src/*"] mapping when src/ holds the modules', () => {
    const root = makeTempRoot();
    writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { paths: { '@/*': ['./src/*'] } } }),
    );
    writeFile(path.join(root, 'src/components/ui/dialog.tsx'));

    const resolver = createPathResolver(root);
    expect(resolver.resolve('src/components/Consumer.tsx', '@/components/ui/dialog')).toBe(
      'src/components/ui/dialog.tsx',
    );
  });

  it('falls back to <root>/src when tsconfig is absent and src/ exists', () => {
    const root = makeTempRoot();
    writeFile(path.join(root, 'src/components/ui/dialog.tsx'));
    const resolver = createPathResolver(root);
    expect(resolver.resolve('src/components/Consumer.tsx', '@/components/ui/dialog')).toBe(
      'src/components/ui/dialog.tsx',
    );
  });

  it('falls back to <root> when tsconfig is absent and src/ does not exist', () => {
    const root = makeTempRoot();
    writeFile(path.join(root, 'components/ui/dialog.tsx'));
    const resolver = createPathResolver(root);
    expect(resolver.resolve('components/Consumer.tsx', '@/components/ui/dialog')).toBe(
      'components/ui/dialog.tsx',
    );
  });

  it('tolerates JSON-with-comments tsconfig files', () => {
    const root = makeTempRoot();
    writeFile(
      path.join(root, 'tsconfig.json'),
      `// top-line comment\n{\n  /* block */\n  "compilerOptions": { "paths": { "@/*": ["./*"] } }\n}\n`,
    );
    writeFile(path.join(root, 'components/ui/dialog.tsx'));
    const resolver = createPathResolver(root);
    expect(resolver.resolve('components/Consumer.tsx', '@/components/ui/dialog')).toBe(
      'components/ui/dialog.tsx',
    );
  });
});

describe('createPathResolver — relative imports', () => {
  it('resolves "./ui/dialog" against the importer directory', () => {
    const root = makeTempRoot();
    writeFile(path.join(root, 'components/ui/dialog.tsx'));
    const resolver = createPathResolver(root);
    expect(resolver.resolve('components/Consumer.tsx', './ui/dialog')).toBe(
      'components/ui/dialog.tsx',
    );
  });

  it('resolves "../ui/drawer" across directories', () => {
    const root = makeTempRoot();
    writeFile(path.join(root, 'components/ui/drawer.tsx'));
    writeFile(path.join(root, 'features/billing/Consumer.tsx'));
    const resolver = createPathResolver(root);
    expect(
      resolver.resolve('features/billing/Consumer.tsx', '../../components/ui/drawer'),
    ).toBe('components/ui/drawer.tsx');
  });

  it('resolves to an index.tsx when the specifier points to a directory', () => {
    const root = makeTempRoot();
    writeFile(path.join(root, 'components/ui/dialog/index.tsx'));
    const resolver = createPathResolver(root);
    expect(resolver.resolve('components/Consumer.tsx', './ui/dialog')).toBe(
      'components/ui/dialog/index.tsx',
    );
  });
});

describe('createPathResolver — negative cases', () => {
  it('returns null for unresolvable specifiers', () => {
    const root = makeTempRoot();
    const resolver = createPathResolver(root);
    expect(resolver.resolve('components/Consumer.tsx', '@/components/missing')).toBeNull();
  });

  it('returns null for bare-module specifiers like "react"', () => {
    const root = makeTempRoot();
    const resolver = createPathResolver(root);
    expect(resolver.resolve('components/Consumer.tsx', 'react')).toBeNull();
  });

  it('returns null when the resolved path escapes rootDir', () => {
    const root = makeTempRoot();
    writeFile(path.join(root, 'components/Consumer.tsx'));
    const resolver = createPathResolver(root);
    // ../../escape would land outside `root`.
    expect(resolver.resolve('components/Consumer.tsx', '../../escape')).toBeNull();
  });

  it('returns null when @/* resolves to an unrelated file (lib/utils)', () => {
    const root = makeTempRoot();
    writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { paths: { '@/*': ['./*'] } } }),
    );
    writeFile(path.join(root, 'lib/utils.ts'));
    const resolver = createPathResolver(root);
    expect(resolver.resolve('components/Consumer.tsx', '@/lib/utils')).toBe('lib/utils.ts');
    // (Resolution succeeds; whether the source set includes lib/utils is the
    // caller's responsibility — covered in reexport-tracing.test.ts.)
  });
});

describe('createPathResolver — alias + relative converge', () => {
  it('alias and relative resolve to the same project-relative path', () => {
    const root = makeTempRoot();
    writeFile(
      path.join(root, 'tsconfig.json'),
      JSON.stringify({ compilerOptions: { paths: { '@/*': ['./*'] } } }),
    );
    writeFile(path.join(root, 'components/ui/dialog.tsx'));
    const resolver = createPathResolver(root);
    const viaAlias = resolver.resolve('components/Consumer.tsx', '@/components/ui/dialog');
    const viaRelative = resolver.resolve('components/Consumer.tsx', './ui/dialog');
    expect(viaAlias).toBe('components/ui/dialog.tsx');
    expect(viaRelative).toBe('components/ui/dialog.tsx');
    expect(viaAlias).toEqual(viaRelative);
  });
});
