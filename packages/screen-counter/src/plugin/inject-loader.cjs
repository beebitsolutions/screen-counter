'use strict';

const path = require('node:path');

const BADGE_IMPORT =
  "import { ScreenCounterBadge as __ScreenCounterBadge__ } from '@beebit/screen-counter/badge';";
const BADGE_MARKER = '__ScreenCounterBadge__';

function buildBadgeTag(opts) {
  const position = opts && opts.badge && opts.badge.position;
  if (!position) return '<__ScreenCounterBadge__ />';
  return '<__ScreenCounterBadge__ position=' + JSON.stringify(position) + ' />';
}

function readOptions(ctx) {
  if (typeof ctx.getOptions === 'function') return ctx.getOptions();
  if (ctx.query && typeof ctx.query === 'object') return ctx.query;
  return { rootDir: process.cwd() };
}

function isRootLayout(resourcePath, rootDir) {
  const normalized = path.normalize(resourcePath);
  const exts = ['tsx', 'jsx', 'ts', 'js'];
  for (const base of ['app', path.join('src', 'app')]) {
    for (const ext of exts) {
      const candidate = path.normalize(path.join(rootDir, base, 'layout.' + ext));
      if (candidate === normalized) return true;
    }
  }
  return false;
}

function injectImport(source) {
  const matches = source.match(/^import [^;]+;\s*$/gm);
  if (matches && matches.length > 0) {
    const last = matches[matches.length - 1];
    const idx = source.lastIndexOf(last) + last.length;
    return source.slice(0, idx) + '\n' + BADGE_IMPORT + source.slice(idx);
  }
  return BADGE_IMPORT + '\n' + source;
}

function injectTag(source, tag) {
  const re = /<\/body>(?![\s\S]*<\/body>)/;
  const match = re.exec(source);
  if (!match) return null;
  const idx = match.index;
  return source.slice(0, idx) + tag + source.slice(idx);
}

function loader(source, sourceMap) {
  const callback = this.callback.bind(this);
  try {
    const opts = readOptions(this);
    if (!isRootLayout(this.resourcePath, opts.rootDir)) {
      callback(null, source, sourceMap);
      return;
    }
    if (source.indexOf(BADGE_MARKER) !== -1) {
      callback(null, source, sourceMap);
      return;
    }
    const tag = buildBadgeTag(opts);
    const withTag = injectTag(source, tag);
    if (withTag === null) {
      process.stderr.write(
        '[@beebit/screen-counter] inject-loader: no </body> tag found in root layout; skipping injection.\n',
      );
      callback(null, source, sourceMap);
      return;
    }
    const withImport = injectImport(withTag);
    callback(null, withImport, sourceMap);
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    process.stderr.write('[@beebit/screen-counter] inject-loader failed: ' + msg + '\n');
    callback(null, source, sourceMap);
  }
}

module.exports = loader;
module.exports.default = loader;
