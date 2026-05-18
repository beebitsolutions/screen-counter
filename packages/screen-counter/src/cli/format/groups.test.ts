import { describe, expect, it } from 'vitest';
import type { ScreenInfo, Signal } from '../../types.js';
import { bucketForEntry, bucketOf, summarizeBuckets } from './groups.js';

const sig = (kind: Signal['kind'], rule: string): Signal => ({ kind, rule });

function modal(signals: Signal[], path = 'components/X.tsx'): ScreenInfo {
  return { kind: 'modal', path, signals };
}

describe('bucketOf — known rule keys map to readable names', () => {
  it('should bucket radix, headlessui, mui, chakra, vaul, custom imports', () => {
    expect(bucketOf(sig('strong', 'import:@radix-ui/react-dialog'))).toBe('radix');
    expect(bucketOf(sig('strong', 'import:@headlessui/react'))).toBe('headlessui');
    expect(bucketOf(sig('strong', 'import:@mui/material'))).toBe('mui');
    expect(bucketOf(sig('strong', 'import:@chakra-ui/react'))).toBe('chakra');
    expect(bucketOf(sig('strong', 'import:vaul'))).toBe('vaul');
    expect(bucketOf(sig('strong', 'import:./my-kit'))).toBe('import');
  });

  it('should bucket shadcn, role, aria, naming, portal, forced, disabled', () => {
    expect(bucketOf(sig('strong', 'path:shadcn-ui'))).toBe('shadcn');
    expect(bucketOf(sig('strong', 'jsx-attr:role=dialog'))).toBe('role');
    expect(bucketOf(sig('strong', 'jsx-attr:aria-modal=true'))).toBe('aria');
    expect(bucketOf(sig('weak', 'name-suffix:Modal'))).toBe('naming');
    expect(bucketOf(sig('weak', 'react-dom:createPortal'))).toBe('portal');
    expect(bucketOf(sig('strong', 'escape-hatch:screen'))).toBe('forced');
    expect(bucketOf(sig('strong', 'escape-hatch:disable'))).toBe('disabled');
  });

  it('should return the raw rule for unknown keys (defensive default)', () => {
    expect(bucketOf(sig('weak', 'unknown:future-rule'))).toBe('unknown:future-rule');
  });
});

describe('bucketForEntry', () => {
  it('should return the bucket of the first strong signal', () => {
    const entry = modal([sig('weak', 'name-suffix:Modal'), sig('strong', 'jsx-attr:role=dialog')]);
    expect(bucketForEntry(entry)).toBe('role');
  });

  it('should join unique weak buckets with + when there is no strong signal', () => {
    const entry = modal([sig('weak', 'name-suffix:Modal'), sig('weak', 'react-dom:createPortal')]);
    expect(bucketForEntry(entry)).toBe('naming+portal');
  });

  it('should return "forced" for forced entries regardless of organic signals', () => {
    const entry: ScreenInfo = {
      kind: 'forced',
      path: 'components/X.tsx',
      signals: [sig('strong', 'escape-hatch:screen'), sig('strong', 'jsx-attr:role=dialog')],
    };
    expect(bucketForEntry(entry)).toBe('forced');
  });

  it('should return "other" when an entry has no signals at all', () => {
    expect(bucketForEntry(modal([]))).toBe('other');
  });
});

describe('summarizeBuckets', () => {
  it('should aggregate, then sort by count desc, alphabetically on ties', () => {
    const entries = [
      modal([sig('strong', 'import:@radix-ui/react-dialog')]),
      modal([sig('strong', 'import:@radix-ui/react-dialog')]),
      modal([sig('strong', 'jsx-attr:role=dialog')]),
      modal([sig('strong', 'jsx-attr:aria-modal=true')]),
    ];
    expect(summarizeBuckets(entries)).toEqual([
      ['radix', 2],
      ['aria', 1],
      ['role', 1],
    ]);
  });
});
