import { VERSION } from '../../version.js';
import type { AnalysisResult } from '../../types.js';

/**
 * Stable JSON shape consumed by tooling — schema documented in
 * `documentation/dev-notes/03-cli-referencia.md` "Output Schema".
 * Trailing newline matches Unix conventions for `--out` writes.
 */
export function formatJson(result: AnalysisResult): string {
  const payload = {
    version: VERSION,
    count: result.count,
    routes: result.routes,
    modals: result.modals,
    disabled: result.disabled,
    warnings: result.warnings ?? [],
  };
  return `${JSON.stringify(payload, null, 2)}\n`;
}
