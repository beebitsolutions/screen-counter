import { describe, expect, it } from 'vitest';
import type { AnalysisResult } from '../../types.js';
import { DEFAULT_BUDGET, type CliOptions } from '../options.js';
import { formatVerbose } from './verbose.js';

const opts: CliOptions = {
  rootDir: '/proj',
  json: false,
  verbose: true,
  budget: DEFAULT_BUDGET,
  colorEnabled: false,
};

describe('formatVerbose', () => {
  it('should prepend a routes section listing path → canonical URL', () => {
    const result: AnalysisResult = {
      count: 2,
      routes: [
        { kind: 'route', path: 'app/page.tsx', route: '/', signals: [] },
        {
          kind: 'route',
          path: 'app/users/[id]/page.tsx',
          route: '/users/[id]',
          signals: [],
        },
      ],
      modals: [],
      disabled: [],
    };
    const out = formatVerbose(result, opts);
    expect(out).toMatch(/routes:/);
    expect(out).toMatch(/app\/page\.tsx\s+→ \//);
    expect(out).toMatch(/app\/users\/\[id\]\/page\.tsx\s+→ \/users\/\[id\]/);
  });

  it('should append a modals section listing rule keys', () => {
    const result: AnalysisResult = {
      count: 1,
      routes: [],
      modals: [
        {
          kind: 'modal',
          path: 'components/LoginModal.tsx',
          signals: [
            { kind: 'strong', rule: 'import:@radix-ui/react-dialog' },
            { kind: 'weak', rule: 'name-suffix:Modal', detail: 'LoginModal' },
          ],
        },
      ],
      disabled: [],
    };
    const out = formatVerbose(result, opts);
    expect(out).toMatch(/modals:/);
    expect(out).toMatch(/strong:import:@radix-ui\/react-dialog/);
    expect(out).toMatch(/weak:name-suffix:Modal:LoginModal/);
  });

  it('should append a disabled section when disabled is non-empty', () => {
    const result: AnalysisResult = {
      count: 0,
      routes: [],
      modals: [],
      disabled: [
        {
          kind: 'disabled',
          path: 'components/Skip.tsx',
          signals: [{ kind: 'strong', rule: 'escape-hatch:disable' }],
        },
      ],
    };
    expect(formatVerbose(result, opts)).toMatch(/disabled:/);
  });

  it('should not crash when both modals and disabled are empty', () => {
    const result: AnalysisResult = { count: 0, routes: [], modals: [], disabled: [] };
    expect(formatVerbose(result, opts)).toMatch(/0 screens total/);
  });
});
