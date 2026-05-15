import type { Signal } from '../../../types.js';
import type { ImportInfo } from '../parse.js';

/**
 * Strong-signal modal libraries that require a specific named specifier to
 * fire. Keyed by module source; value is the set of imported names that count.
 * Module sources not in this map are treated as "any import counts".
 */
const SPECIFIER_GATED: Record<string, ReadonlyArray<string>> = {
  '@headlessui/react': ['Dialog'],
  '@mui/material': ['Modal', 'Dialog', 'Drawer'],
  '@chakra-ui/react': ['Modal', 'Drawer'],
};

/** Sources that fire on any import. */
const ANY_IMPORT: ReadonlyArray<string> = ['@radix-ui/react-dialog', 'vaul'];

/** shadcn-style file paths that fire as a strong signal regardless of contents. */
const SHADCN_BASENAMES: ReadonlyArray<string> = ['dialog', 'sheet', 'drawer', 'alert-dialog'];

/**
 * Strong signal: the file imports from a known modal library, OR matches the
 * shadcn `components/ui/<basename>.tsx` path pattern. Returns one signal per
 * distinct source that matched.
 */
export function detectModalLibraryImport(
  imports: ImportInfo[],
  filePath: string,
  extraSources: ReadonlyArray<string>,
): Signal[] {
  const signals: Signal[] = [];
  const userSources = new Set(extraSources);

  for (const imp of imports) {
    if (ANY_IMPORT.includes(imp.source) || userSources.has(imp.source)) {
      signals.push({ kind: 'strong', rule: `import:${imp.source}` });
      continue;
    }
    const requiredNames = SPECIFIER_GATED[imp.source];
    if (!requiredNames) continue;
    const matched = imp.specifiers.find((s) => requiredNames.includes(s.imported));
    if (matched) {
      signals.push({
        kind: 'strong',
        rule: `import:${imp.source}`,
        detail: matched.imported,
      });
    }
  }

  if (matchesShadcnPath(filePath)) {
    signals.push({ kind: 'strong', rule: 'path:shadcn-ui' });
  }

  return signals;
}

function matchesShadcnPath(filePath: string): boolean {
  const lower = filePath.toLowerCase();
  for (const basename of SHADCN_BASENAMES) {
    if (
      lower.endsWith(`/components/ui/${basename}.tsx`) ||
      lower === `components/ui/${basename}.tsx`
    ) {
      return true;
    }
  }
  return false;
}
