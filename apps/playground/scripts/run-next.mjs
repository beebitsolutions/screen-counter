#!/usr/bin/env node
// Thin wrapper around the `next` CLI that pins the bundler to webpack on
// Next.js 16+ (Turbopack is the default there). On Next.js 15 — where
// `--webpack` does not exist and webpack is already the default — the flag
// is omitted to keep the same `pnpm dev` / CI matrix command working
// against both versions.
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const req = createRequire(import.meta.url);
const { version } = req('next/package.json');
const major = Number.parseInt(version.split('.')[0], 10);

const args = process.argv.slice(2);
const hasBundlerFlag = args.some(
  (a) => a === '--webpack' || a === '--turbo' || a === '--turbopack',
);
if (Number.isFinite(major) && major >= 16 && !hasBundlerFlag) {
  args.push('--webpack');
}

const nextBin = req.resolve('next/dist/bin/next');
const child = spawn(process.execPath, [nextBin, ...args], { stdio: 'inherit' });
child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 0);
});
