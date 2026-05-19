import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(HERE, '..', '..');
const CLI_PATH = path.join(PACKAGE_ROOT, 'dist', 'cli.js');
const PLAYGROUND = path.resolve(PACKAGE_ROOT, '..', '..', 'apps', 'playground');

const EXPECTED_COUNT = 25;

interface CliRun {
  stdout: string;
  stderr: string;
  code: number;
}

function runCli(args: readonly string[]): Promise<CliRun> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [CLI_PATH, ...args], {
      cwd: PACKAGE_ROOT,
      env: { ...process.env, NO_COLOR: '1', FORCE_COLOR: '0' },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk: Buffer) => {
      stdout += chunk.toString('utf8');
    });
    child.stderr.on('data', (chunk: Buffer) => {
      stderr += chunk.toString('utf8');
    });
    child.on('error', reject);
    child.on('close', (code) => {
      resolve({ stdout, stderr, code: code ?? -1 });
    });
  });
}

let cliBuilt = false;

beforeAll(async () => {
  cliBuilt = await fs
    .stat(CLI_PATH)
    .then((s) => s.isFile())
    .catch(() => false);
});

describe('CLI smoke against apps/playground', () => {
  it('the CLI binary must be built (run `pnpm build` first)', () => {
    expect(cliBuilt).toBe(true);
  });

  it('--json on the playground should report count===25 and exit 0', async () => {
    const result = await runCli([PLAYGROUND, '--json']);
    expect(result.code).toBe(0);
    const parsed = JSON.parse(result.stdout) as { count: number };
    expect(parsed.count).toBe(EXPECTED_COUNT);
  });

  it('--verbose on the playground should print signal annotations and exit 0', async () => {
    const result = await runCli([PLAYGROUND, '--verbose']);
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/strong:|weak:/);
  });

  it('--out should write a parseable JSON report to the given path', async () => {
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sc-smoke-out-'));
    const outFile = path.join(tmpDir, 'sc.json');
    try {
      const result = await runCli([PLAYGROUND, '--json', '--out', outFile]);
      expect(result.code).toBe(0);
      const onDisk = JSON.parse(await fs.readFile(outFile, 'utf8')) as { count: number };
      expect(onDisk.count).toBe(EXPECTED_COUNT);
    } finally {
      await fs.rm(tmpDir, { recursive: true, force: true });
    }
  });
});
