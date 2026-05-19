/**
 * Extract the final "word" of a component name or file basename.
 *
 * Normalises three casings used in the wild:
 * - PascalCase / camelCase  ⇒ `LoginModal`     → `modal`
 * - kebab-case              ⇒ `login-modal`    → `modal`
 * - snake_case              ⇒ `login_modal`    → `modal`
 *
 * The strategy: strip a `.tsx`/`.ts`/`.jsx`/`.js` extension if present, split
 * on `-` or `_` to isolate the trailing segment, then split that segment on
 * CamelCase transitions and return the last part lowercased.
 *
 * Used by the naming heuristic (inclusion) and the scoring exclusion check.
 * Pure — no I/O, no deps.
 */
export function lastWord(name: string): string {
  if (name.length === 0) return '';
  const base = name.replace(/\.[jt]sx?$/i, '');
  const dashSegments = base.split(/[-_]/);
  const lastSegment = dashSegments[dashSegments.length - 1] ?? '';
  if (lastSegment.length === 0) return '';
  const camelParts = lastSegment.replace(/([a-z0-9])([A-Z])/g, '$1 $2').split(/\s+/);
  const final = camelParts[camelParts.length - 1] ?? '';
  return final.toLowerCase();
}
