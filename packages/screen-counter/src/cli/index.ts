import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { Command, InvalidArgumentError } from 'commander';
import type { Config } from '../types.js';
import { VERSION } from '../version.js';
import { runOnce } from './run.js';
import { runWatch } from './watch.js';
import { DEFAULT_BUDGET, type CliOptions } from './options.js';

/**
 * Exit codes used throughout the CLI.
 *
 * - `0` success
 * - `1` runtime error inside the analyzer (parse failure, IO error)
 * - `2` configuration / argument error (bad path, missing file, bad flag)
 */
const EXIT = { ok: 0, runtime: 1, config: 2 } as const;

interface RawFlags {
  json?: boolean;
  out?: string;
  watch?: boolean;
  verbose?: boolean;
  config?: string;
}

async function main(argv: string[]): Promise<number> {
  const program = new Command();
  program
    .name('@beebit/screen-counter')
    .description('Count screens (routes + modals) in a Next.js project.')
    .argument('[path]', 'Project root to analyze (defaults to current working directory)', '.')
    .option('--json', 'Emit a structured JSON report on stdout (disables colours).')
    .option('--out <path>', 'Write the report to a file instead of stdout.')
    .option('--watch', 'Re-analyze on file changes (debounced 150ms). Exit with Ctrl+C.')
    .option('--verbose', 'Show per-component signal breakdown.')
    .option('--config <path>', 'Path to an explicit screen-counter config file (.mjs|.cjs|.js).')
    .version(VERSION, '-v, --version', 'Print the package version.')
    .helpOption('-h, --help', 'Show this help.')
    .showSuggestionAfterError(true)
    .exitOverride();

  let parsed: { args: string[]; opts: RawFlags };
  try {
    program.parse(argv, { from: 'node' });
    parsed = { args: program.args, opts: program.opts<RawFlags>() };
  } catch (err) {
    return handleCommanderError(err);
  }

  const rawPath = parsed.args[0] ?? '.';
  const rootDir = path.resolve(rawPath);
  if (!(await isDirectory(rootDir))) {
    process.stderr.write(`error: path is not a directory: ${rootDir}\n`);
    return EXIT.config;
  }

  let config: Config | undefined;
  let configPath: string | undefined;
  if (parsed.opts.config) {
    const resolved = path.resolve(parsed.opts.config);
    if (!(await isFile(resolved))) {
      process.stderr.write(`error: --config file not found: ${resolved}\n`);
      return EXIT.config;
    }
    try {
      config = await loadExplicitConfig(resolved);
      configPath = resolved;
    } catch (err) {
      process.stderr.write(`error: failed to load --config: ${errorMessage(err)}\n`);
      return EXIT.config;
    }
  }

  const opts: CliOptions = {
    rootDir,
    json: Boolean(parsed.opts.json),
    verbose: Boolean(parsed.opts.verbose),
    budget: DEFAULT_BUDGET,
    colorEnabled: shouldColor({
      jsonMode: Boolean(parsed.opts.json),
      writingToFile: parsed.opts.out !== undefined,
    }),
    ...(parsed.opts.out !== undefined ? { out: parsed.opts.out } : {}),
    ...(configPath !== undefined ? { configPath } : {}),
    ...(config !== undefined ? { config } : {}),
  };

  try {
    if (parsed.opts.watch) {
      return await runWatch(opts);
    }
    await runOnce(opts);
    return EXIT.ok;
  } catch (err) {
    process.stderr.write(`error: ${errorMessage(err)}\n`);
    return isConfigError(err) ? EXIT.config : EXIT.runtime;
  }
}

function shouldColor(ctx: { jsonMode: boolean; writingToFile: boolean }): boolean {
  if (ctx.jsonMode) return false;
  if (ctx.writingToFile) return false;
  if (process.env['NO_COLOR']) return false;
  return Boolean(process.stdout.isTTY);
}

async function isDirectory(p: string): Promise<boolean> {
  try {
    return (await fs.stat(p)).isDirectory();
  } catch {
    return false;
  }
}

async function isFile(p: string): Promise<boolean> {
  try {
    return (await fs.stat(p)).isFile();
  } catch {
    return false;
  }
}

async function loadExplicitConfig(file: string): Promise<Config> {
  const mod: unknown = await import(pathToFileURL(file).href);
  const exported =
    mod && typeof mod === 'object' && 'default' in mod ? (mod as { default: unknown }).default : mod;
  if (!exported || typeof exported !== 'object' || Array.isArray(exported)) {
    throw new TypeError(`config must default-export a plain object`);
  }
  return exported as Config;
}

function isConfigError(err: unknown): boolean {
  return err instanceof TypeError;
}

function errorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

function handleCommanderError(err: unknown): number {
  if (err instanceof InvalidArgumentError) return EXIT.config;
  const code = (err as { code?: string }).code;
  if (code === 'commander.helpDisplayed' || code === 'commander.version') return EXIT.ok;
  if (code === 'commander.help') return EXIT.ok;
  if (
    code === 'commander.unknownOption' ||
    code === 'commander.unknownCommand' ||
    code === 'commander.missingArgument' ||
    code === 'commander.invalidArgument' ||
    code === 'commander.excessArguments'
  ) {
    return EXIT.config;
  }
  process.stderr.write(`error: ${errorMessage(err)}\n`);
  return EXIT.runtime;
}

void main(process.argv).then(
  (code) => {
    process.exit(code);
  },
  (err: unknown) => {
    process.stderr.write(`fatal: ${errorMessage(err)}\n`);
    process.exit(EXIT.runtime);
  },
);
