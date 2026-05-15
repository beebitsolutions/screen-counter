import path from 'node:path';
import type { Signal } from '../../../types.js';

/**
 * Weak signal: the component name or file basename ends with one of the
 * configured suffixes (default: `Modal`, `Dialog`, `Drawer`, `Sheet`,
 * `Popup`, `Lightbox`, `Overlay`).
 *
 * Emits at most one signal — the first matching suffix wins so the `detail`
 * field stays stable across runs.
 */
export function detectNameSuffix(
  componentName: string | null,
  filePath: string,
  suffixes: ReadonlyArray<string>,
): Signal[] {
  const basename = path.posix.basename(filePath).replace(/\.[^.]+$/, '');
  for (const suffix of suffixes) {
    if (suffix.length === 0) continue;
    if (componentName && componentName.endsWith(suffix)) {
      return [{ kind: 'weak', rule: `name-suffix:${suffix}`, detail: componentName }];
    }
    if (basename.endsWith(suffix)) {
      return [{ kind: 'weak', rule: `name-suffix:${suffix}`, detail: basename }];
    }
  }
  return [];
}
