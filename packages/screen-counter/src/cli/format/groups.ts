import type { ScreenInfo, Signal } from '../../types.js';

/**
 * Friendly bucket name for a single signal — used by the human summary to
 * print `(radix: 4, naming+portal: 2, aria: 1)` style breakdowns.
 *
 * Rule keys themselves are stable (see `documentation/dev-notes/02-heuristicas-modales.md`)
 * but ugly for end users. This map keeps the buckets readable while leaving
 * verbose/JSON output to print the raw keys.
 */
export function bucketOf(signal: Signal): string {
  const { rule } = signal;
  if (rule.startsWith('import:@radix-ui')) return 'radix';
  if (rule.startsWith('import:@headlessui')) return 'headlessui';
  if (rule.startsWith('import:@mui')) return 'mui';
  if (rule.startsWith('import:@chakra-ui')) return 'chakra';
  if (rule.startsWith('import:vaul')) return 'vaul';
  if (rule.startsWith('import:')) return 'import';
  if (rule === 'path:shadcn-ui') return 'shadcn';
  if (rule === 'jsx-attr:role=dialog') return 'role';
  if (rule === 'jsx-attr:aria-modal=true') return 'aria';
  if (rule.startsWith('name-suffix:')) return 'naming';
  if (rule === 'react-dom:createPortal') return 'portal';
  if (rule === 'escape-hatch:screen') return 'forced';
  if (rule === 'escape-hatch:disable') return 'disabled';
  return rule;
}

/**
 * Reduce a modal entry to a single bucket label. Strong signals win; otherwise
 * weak signals are joined with `+` so `LoginDialog` with naming + portal shows
 * up as `naming+portal`.
 */
export function bucketForEntry(entry: ScreenInfo): string {
  if (entry.kind === 'forced') return 'forced';
  const strong = entry.signals.find((s) => s.kind === 'strong');
  if (strong) return bucketOf(strong);
  const weakBuckets = entry.signals
    .filter((s) => s.kind === 'weak')
    .map(bucketOf);
  if (weakBuckets.length === 0) return 'other';
  return [...new Set(weakBuckets)].sort().join('+');
}

/**
 * Aggregate modals by bucket, returning entries sorted by descending count
 * (ties broken alphabetically) so output is deterministic.
 */
export function summarizeBuckets(entries: ScreenInfo[]): Array<[string, number]> {
  const counts = new Map<string, number>();
  for (const entry of entries) {
    const bucket = bucketForEntry(entry);
    counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0] < b[0] ? -1 : 1;
  });
}
