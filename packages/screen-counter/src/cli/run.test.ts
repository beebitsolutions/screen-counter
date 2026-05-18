import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { AnalysisResult } from '../types.js';
import { DEFAULT_BUDGET, type CliOptions } from './options.js';
import { render, runOnce } from './run.js';

let tmpDir = '';

beforeEach(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sc-run-'));
});

afterEach(async () => {
  if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true });
});

const empty: AnalysisResult = { count: 0, routes: [], modals: [], disabled: [] };

function opts(extra: Partial<CliOptions> = {}): CliOptions {
  return {
    rootDir: tmpDir,
    json: false,
    verbose: false,
    budget: DEFAULT_BUDGET,
    colorEnabled: false,
    ...extra,
  };
}

describe('render', () => {
  it('should pick JSON formatter when opts.json is true', () => {
    expect(render(empty, opts({ json: true }))).toMatch(/"count": 0/);
  });

  it('should pick verbose formatter when opts.verbose is true', () => {
    const result: AnalysisResult = {
      count: 1,
      routes: [],
      modals: [
        {
          kind: 'modal',
          path: 'components/X.tsx',
          signals: [{ kind: 'strong', rule: 'jsx-attr:role=dialog' }],
        },
      ],
      disabled: [],
    };
    expect(render(result, opts({ verbose: true }))).toMatch(/modals:/);
  });

  it('should default to the human formatter', () => {
    expect(render(empty, opts())).toMatch(/0 screens total/);
  });
});

describe('runOnce', () => {
  it('should write JSON to --out when configured, creating intermediate dirs', async () => {
    const outFile = path.join(tmpDir, 'nested', 'dir', 'report.json');
    const result = await runOnce(opts({ json: true, out: outFile }));
    expect(result).toMatchObject({ count: 0 });
    const contents = await fs.readFile(outFile, 'utf8');
    expect(JSON.parse(contents).count).toBe(0);
  });
});
