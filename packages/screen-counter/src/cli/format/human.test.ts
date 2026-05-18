import { describe, expect, it } from 'vitest';
import type { AnalysisResult, ScreenInfo } from '../../types.js';
import { DEFAULT_BUDGET, type CliOptions } from '../options.js';
import { formatHuman } from './human.js';

const opts: CliOptions = {
  rootDir: '/proj',
  json: false,
  verbose: false,
  budget: DEFAULT_BUDGET,
  colorEnabled: false,
};

const empty: AnalysisResult = { count: 0, routes: [], modals: [], disabled: [] };

const fakeModal = (path: string, rule: string): ScreenInfo => ({
  kind: 'modal',
  path,
  signals: [{ kind: 'strong', rule }],
});

describe('formatHuman', () => {
  it('should pluralise routes and modals correctly', () => {
    const out = formatHuman({ ...empty, count: 0 }, opts);
    expect(out).toMatch(/0 routes/);
    expect(out).toMatch(/0 modals/);

    const oneEach: AnalysisResult = {
      count: 2,
      routes: [{ kind: 'route', path: 'app/page.tsx', route: '/', signals: [] }],
      modals: [fakeModal('components/A.tsx', 'import:@radix-ui/react-dialog')],
      disabled: [],
    };
    const out2 = formatHuman(oneEach, opts);
    expect(out2).toMatch(/1 route\b/);
    expect(out2).toMatch(/1 modal\b/);
  });

  it('should show the buckets breakdown when modals are present', () => {
    const result: AnalysisResult = {
      count: 2,
      routes: [],
      modals: [
        fakeModal('components/A.tsx', 'import:@radix-ui/react-dialog'),
        fakeModal('components/B.tsx', 'import:@radix-ui/react-dialog'),
      ],
      disabled: [],
    };
    expect(formatHuman(result, opts)).toMatch(/radix: 2/);
  });

  it('should note manually-excluded components when disabled is non-empty', () => {
    const result: AnalysisResult = {
      ...empty,
      disabled: [
        {
          kind: 'disabled',
          path: 'components/X.tsx',
          signals: [{ kind: 'strong', rule: 'escape-hatch:disable' }],
        },
      ],
    };
    expect(formatHuman(result, opts)).toMatch(/1 component\s+excluded manually/);
  });

  it('should print the total screen count', () => {
    const result: AnalysisResult = { ...empty, count: 25 };
    expect(formatHuman(result, opts)).toMatch(/25 screens total/);
  });

  it('should print warnings section when warnings are present', () => {
    const result: AnalysisResult = { ...empty, warnings: ['Parallel route skipped: app/@modal/page.tsx'] };
    const out = formatHuman(result, opts);
    expect(out).toMatch(/warnings:/);
    expect(out).toMatch(/Parallel route/);
  });
});
