import { describe, expect, it } from 'vitest';
import type { Signal } from '../../types.js';
import {
  DEFAULT_EXCLUDE_SUFFIXES,
  DEFAULT_SCORING_THRESHOLD,
} from '../../config/schema.js';
import { classifyCandidate, type ClassifyContext } from './scoring.js';

const strong = (rule: string): Signal => ({ kind: 'strong', rule });
const weak = (rule: string): Signal => ({ kind: 'weak', rule });

function ctx(overrides: Partial<ClassifyContext> = {}): ClassifyContext {
  return {
    escapeHatch: null,
    componentName: 'LoginModal',
    filePath: 'components/LoginModal.tsx',
    signals: [],
    excludeSuffixes: [...DEFAULT_EXCLUDE_SUFFIXES],
    threshold: { ...DEFAULT_SCORING_THRESHOLD },
    ...overrides,
  };
}

describe('classifyCandidate — scoring formula', () => {
  it('should classify as modal with a single strong signal', () => {
    const result = classifyCandidate(ctx({ signals: [strong('jsx-attr:role=dialog')] }));
    expect(result).toEqual({
      kind: 'modal',
      signals: [{ kind: 'strong', rule: 'jsx-attr:role=dialog' }],
    });
  });

  it('should classify as modal with two weak signals', () => {
    const result = classifyCandidate(
      ctx({ signals: [weak('name-suffix:Modal'), weak('react-dom:createPortal')] }),
    );
    expect(result?.kind).toBe('modal');
  });

  it('should NOT classify as modal with a single weak signal', () => {
    expect(classifyCandidate(ctx({ signals: [weak('name-suffix:Modal')] }))).toBeNull();
  });

  it('should NOT classify as modal with zero signals', () => {
    expect(classifyCandidate(ctx({ signals: [] }))).toBeNull();
  });

  it('should honour a custom weak threshold of 1', () => {
    const result = classifyCandidate(
      ctx({
        signals: [weak('name-suffix:Modal')],
        threshold: { strong: 1, weak: 1 },
      }),
    );
    expect(result?.kind).toBe('modal');
  });

  it('should require two strong signals when threshold.strong=2', () => {
    expect(
      classifyCandidate(
        ctx({
          signals: [strong('jsx-attr:role=dialog')],
          threshold: { strong: 2, weak: 99 },
        }),
      ),
    ).toBeNull();
    expect(
      classifyCandidate(
        ctx({
          signals: [strong('jsx-attr:role=dialog'), strong('jsx-attr:aria-modal=true')],
          threshold: { strong: 2, weak: 99 },
        }),
      ),
    ).toMatchObject({ kind: 'modal' });
  });
});

describe('classifyCandidate — exclusion suffixes', () => {
  it('should exclude (return null) when component name ends in Provider', () => {
    const result = classifyCandidate(
      ctx({
        componentName: 'LoginModalProvider',
        filePath: 'components/LoginModalProvider.tsx',
        signals: [strong('import:@radix-ui/react-dialog')],
      }),
    );
    expect(result).toBeNull();
  });

  it('should exclude when file basename ends in Context', () => {
    const result = classifyCandidate(
      ctx({
        componentName: null,
        filePath: 'components/ModalContext.tsx',
        signals: [strong('import:@radix-ui/react-dialog')],
      }),
    );
    expect(result).toBeNull();
  });

  it('should exclude when component name ends in Wrapper', () => {
    const result = classifyCandidate(
      ctx({
        componentName: 'DrawerWrapper',
        filePath: 'components/DrawerWrapper.tsx',
        signals: [weak('name-suffix:Drawer'), weak('react-dom:createPortal')],
      }),
    );
    expect(result).toBeNull();
  });

  it('should exclude even when escape-hatch="screen" is set (exclusion list is absolute)', () => {
    const result = classifyCandidate(
      ctx({
        escapeHatch: 'screen',
        componentName: 'LoginModalProvider',
        filePath: 'components/LoginModalProvider.tsx',
        signals: [strong('import:@radix-ui/react-dialog')],
      }),
    );
    expect(result).toBeNull();
  });
});

describe('classifyCandidate — escape hatches', () => {
  it('should classify as disabled when escapeHatch="disable" (no other signals reported)', () => {
    const result = classifyCandidate(
      ctx({
        escapeHatch: 'disable',
        signals: [strong('import:@radix-ui/react-dialog')],
      }),
    );
    expect(result).toEqual({
      kind: 'disabled',
      signals: [{ kind: 'strong', rule: 'escape-hatch:disable' }],
    });
  });

  it('should classify as forced when escapeHatch="screen" with no organic signals', () => {
    const result = classifyCandidate(
      ctx({
        escapeHatch: 'screen',
        componentName: 'PlainCard',
        filePath: 'components/PlainCard.tsx',
        signals: [],
      }),
    );
    expect(result).toEqual({
      kind: 'forced',
      signals: [{ kind: 'strong', rule: 'escape-hatch:screen' }],
    });
  });

  it('should classify as forced and keep organic signals when escapeHatch="screen" fires together', () => {
    const result = classifyCandidate(
      ctx({
        escapeHatch: 'screen',
        signals: [strong('import:@radix-ui/react-dialog')],
      }),
    );
    expect(result).toEqual({
      kind: 'forced',
      signals: [
        { kind: 'strong', rule: 'escape-hatch:screen' },
        { kind: 'strong', rule: 'import:@radix-ui/react-dialog' },
      ],
    });
  });

  it('should prefer disable over exclusion suffix check', () => {
    const result = classifyCandidate(
      ctx({
        escapeHatch: 'disable',
        componentName: 'LoginModalProvider',
        filePath: 'components/LoginModalProvider.tsx',
      }),
    );
    expect(result).toEqual({
      kind: 'disabled',
      signals: [{ kind: 'strong', rule: 'escape-hatch:disable' }],
    });
  });
});
