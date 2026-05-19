import path from 'node:path';
import type { Signal } from '../../../types.js';
import { lastWord } from '../name-utils.js';

/**
 * Weak signal: the component name or file basename ends with one of the
 * configured suffixes (default: `Modal`, `Dialog`, `Drawer`, `Sheet`,
 * `Popup`, `Lightbox`, `Overlay`).
 *
 * Matching is done on the **last word** of the name, lowercased — so all of
 * `LoginModal.tsx`, `login-modal.tsx` and `login_modal.tsx` match `Modal`.
 * The rule key always uses the canonical config-cased suffix (`Modal`,
 * `Dialog`, …) regardless of how the file was actually cased, so snapshots
 * for PascalCase fixtures stay stable.
 *
 * Emits at most one signal — the first matching suffix in the configured
 * order wins so the `detail` field stays deterministic across runs.
 */
export function detectNameSuffix(
  componentName: string | null,
  filePath: string,
  suffixes: ReadonlyArray<string>,
): Signal[] {
  if (suffixes.length === 0) return [];
  const basename = path.posix.basename(filePath);

  const fileWord = lastWord(basename);
  const nameWord = componentName ? lastWord(componentName) : '';

  for (const suffix of suffixes) {
    if (suffix.length === 0) continue;
    const lower = suffix.toLowerCase();
    if (nameWord === lower) {
      return [{ kind: 'weak', rule: `name-suffix:${suffix}`, detail: componentName ?? '' }];
    }
    if (fileWord === lower) {
      return [
        { kind: 'weak', rule: `name-suffix:${suffix}`, detail: stripExtension(basename) },
      ];
    }
  }
  return [];
}

function stripExtension(basename: string): string {
  return basename.replace(/\.[^.]+$/, '');
}
