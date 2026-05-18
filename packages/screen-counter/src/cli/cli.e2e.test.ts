import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = path.resolve(HERE, '..', '..');
const CLI_PATH = path.join(PACKAGE_ROOT, 'dist', 'cli.js');

interface CliRun {
  stdout: string;
  stderr: string;
  code: number;
}

function runCli(args: readonly string[], opts: { cwd?: string } = {}): Promise<CliRun> {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [CLI_PATH, ...args], {
      cwd: opts.cwd ?? PACKAGE_ROOT,
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

/**
 * Build an isolated tmp dir holding a tiny Next.js project (2 routes + 1 Radix
 * modal = 3 screens). Caller is responsible for cleanup in a `finally` block —
 * we deliberately avoid `onTestFinished` because vitest's AsyncLocalStorage
 * context binding can be lost across awaits in concurrent helpers.
 */
async function createFixture(): Promise<{ tmpDir: string; fixtureDir: string }> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sc-cli-'));
  const fixtureDir = path.join(tmpDir, 'fixture');
  await fs.mkdir(path.join(fixtureDir, 'app', 'about'), { recursive: true });
  await fs.writeFile(
    path.join(fixtureDir, 'app', 'page.tsx'),
    `export default function P(){return <div/>;}`,
    'utf8',
  );
  await fs.writeFile(
    path.join(fixtureDir, 'app', 'about', 'page.tsx'),
    `export default function P(){return <div/>;}`,
    'utf8',
  );
  await fs.mkdir(path.join(fixtureDir, 'components'), { recursive: true });
  await fs.writeFile(
    path.join(fixtureDir, 'components', 'LoginModal.tsx'),
    `
      import * as Dialog from '@radix-ui/react-dialog';
      export default function LoginModal(){ return <Dialog.Root>x</Dialog.Root>; }
    `,
    'utf8',
  );
  return { tmpDir, fixtureDir };
}

async function withFixture<T>(
  body: (fx: { tmpDir: string; fixtureDir: string }) => Promise<T>,
): Promise<T> {
  const fx = await createFixture();
  try {
    return await body(fx);
  } finally {
    await fs.rm(fx.tmpDir, { recursive: true, force: true });
  }
}

let cliBuilt = false;

beforeAll(async () => {
  cliBuilt = await fs
    .stat(CLI_PATH)
    .then((s) => s.isFile())
    .catch(() => false);
});

describe('CLI E2E', () => {
  it('the CLI binary must be built (run `pnpm build` first)', () => {
    expect(cliBuilt).toBe(true);
  });

  it.concurrent('--help should list every documented flag and exit 0', async () => {
    const result = await runCli(['--help']);
    expect(result.code).toBe(0);
    for (const flag of ['--json', '--out', '--watch', '--verbose', '--config', '--version']) {
      expect(result.stdout).toContain(flag);
    }
  });

  it.concurrent('--version should print the package version from package.json', async () => {
    const pkg = JSON.parse(
      await fs.readFile(path.join(PACKAGE_ROOT, 'package.json'), 'utf8'),
    ) as { version: string };
    const result = await runCli(['--version']);
    expect(result.code).toBe(0);
    expect(result.stdout.trim()).toBe(pkg.version);
  });

  it.concurrent(
    'analyzing a fixture project should print a human report with the correct totals',
    async () => {
      await withFixture(async ({ fixtureDir }) => {
        const result = await runCli([fixtureDir]);
        expect(result.code).toBe(0);
        expect(result.stdout).toMatch(/2 routes/);
        expect(result.stdout).toMatch(/1 modal\b/);
        expect(result.stdout).toMatch(/3 screens total/);
      });
    },
  );

  it.concurrent('--json should print parseable JSON with the documented shape', async () => {
    await withFixture(async ({ fixtureDir }) => {
      const result = await runCli([fixtureDir, '--json']);
      expect(result.code).toBe(0);
      const payload = JSON.parse(result.stdout) as Record<string, unknown>;
      expect(payload).toMatchObject({
        count: 3,
        version: expect.any(String),
        routes: expect.any(Array),
        modals: expect.any(Array),
        disabled: expect.any(Array),
        warnings: expect.any(Array),
      });
    });
  });

  it.concurrent(
    '--json --out should create the report file with newline-terminated JSON',
    async () => {
      await withFixture(async ({ tmpDir, fixtureDir }) => {
        const outFile = path.join(tmpDir, 'report.json');
        const result = await runCli([fixtureDir, '--json', '--out', outFile]);
        expect(result.code).toBe(0);
        const contents = await fs.readFile(outFile, 'utf8');
        expect(contents.endsWith('\n')).toBe(true);
        const payload = JSON.parse(contents) as { count: number };
        expect(payload.count).toBe(3);
      });
    },
  );

  it.concurrent(
    '--config pointing at a missing file should exit with config error (code 2)',
    async () => {
      await withFixture(async ({ fixtureDir }) => {
        const result = await runCli([fixtureDir, '--config', '/no/such/config.mjs']);
        expect(result.code).toBe(2);
        expect(result.stderr).toMatch(/--config file not found/);
      });
    },
  );

  it.concurrent('--verbose should print a per-component signal breakdown', async () => {
    await withFixture(async ({ fixtureDir }) => {
      const result = await runCli([fixtureDir, '--verbose']);
      expect(result.code).toBe(0);
      expect(result.stdout).toMatch(/modals:/);
      expect(result.stdout).toMatch(/strong:import:@radix-ui\/react-dialog/);
    });
  });
});
