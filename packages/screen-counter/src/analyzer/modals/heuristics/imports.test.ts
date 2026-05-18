import { describe, expect, it } from 'vitest';
import { parseSnippet } from '../__test-helpers__/snippets.js';
import { detectModalLibraryImport } from './imports.js';

function run(code: string, filePath = 'components/Snippet.tsx', extras: readonly string[] = []) {
  const { imports } = parseSnippet(code, filePath);
  return detectModalLibraryImport(imports, filePath, extras);
}

describe('imports heuristic — positive cases', () => {
  it('should detect strong signal for @radix-ui/react-dialog namespace import', () => {
    const signals = run(`import * as Dialog from '@radix-ui/react-dialog';`);
    expect(signals).toEqual([{ kind: 'strong', rule: 'import:@radix-ui/react-dialog' }]);
  });

  it('should detect strong signal for @headlessui/react when Dialog is imported', () => {
    const signals = run(`import { Dialog } from '@headlessui/react';`);
    expect(signals).toEqual([
      { kind: 'strong', rule: 'import:@headlessui/react', detail: 'Dialog' },
    ]);
  });

  it('should detect strong signal for @mui/material when Drawer is imported', () => {
    const signals = run(`import { Drawer } from '@mui/material';`);
    expect(signals).toEqual([{ kind: 'strong', rule: 'import:@mui/material', detail: 'Drawer' }]);
  });

  it('should detect strong signal for @chakra-ui/react when Modal is imported', () => {
    const signals = run(`import { Modal } from '@chakra-ui/react';`);
    expect(signals).toEqual([{ kind: 'strong', rule: 'import:@chakra-ui/react', detail: 'Modal' }]);
  });

  it('should detect strong signal for vaul on any import', () => {
    const signals = run(`import { Drawer } from 'vaul';`);
    expect(signals).toEqual([{ kind: 'strong', rule: 'import:vaul' }]);
  });

  it('should detect strong signal from a user-supplied modalLibraries source', () => {
    const code = `import './my-modal-kit';`;
    const signals = run(code, 'components/X.tsx', ['./my-modal-kit']);
    expect(signals).toEqual([{ kind: 'strong', rule: 'import:./my-modal-kit' }]);
  });

  it('should detect shadcn path:shadcn-ui regardless of imports', () => {
    const signals = run(`export const X = 1;`, 'components/ui/dialog.tsx');
    expect(signals).toEqual([{ kind: 'strong', rule: 'path:shadcn-ui' }]);
  });
});

describe('imports heuristic — negative cases', () => {
  it('should NOT detect signal for unrelated imports', () => {
    expect(run(`import { useState } from 'react';`)).toEqual([]);
  });

  it('should NOT detect @mui/material signal for Button (not a modal specifier)', () => {
    expect(run(`import { Button } from '@mui/material';`)).toEqual([]);
  });

  it('should NOT detect partial-match library names (no false positives on prefix)', () => {
    expect(run(`import { Anything } from '@radix-ui/react-dialog-x';`)).toEqual([]);
  });

  it('should NOT detect @headlessui/react when only non-Dialog specifiers are imported', () => {
    expect(run(`import { Menu, Transition } from '@headlessui/react';`)).toEqual([]);
  });

  it('should NOT detect @chakra-ui/react when only Button is imported', () => {
    expect(run(`import { Button } from '@chakra-ui/react';`)).toEqual([]);
  });

  it('should NOT detect shadcn path for unrelated file paths', () => {
    expect(run(`export const X = 1;`, 'components/dialog.tsx')).toEqual([]);
  });
});
