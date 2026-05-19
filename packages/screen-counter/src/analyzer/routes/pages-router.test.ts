import { describe, expect, it } from 'vitest';
import { classifyPagesRouterFile, pagesPathToRoute } from './pages-router.js';

describe('classifyPagesRouterFile — routes', () => {
  it('classifies pages/index.tsx as the root route /', () => {
    expect(classifyPagesRouterFile('pages/index.tsx', 'pages')).toEqual({
      kind: 'route',
      route: '/',
    });
  });

  it('classifies a flat file as /<basename>', () => {
    expect(classifyPagesRouterFile('pages/about.tsx', 'pages')).toEqual({
      kind: 'route',
      route: '/about',
    });
  });

  it('collapses a nested index.tsx to its directory', () => {
    expect(classifyPagesRouterFile('pages/users/index.tsx', 'pages')).toEqual({
      kind: 'route',
      route: '/users',
    });
  });

  it('preserves dynamic segments [id]', () => {
    expect(classifyPagesRouterFile('pages/users/[id].tsx', 'pages')).toEqual({
      kind: 'route',
      route: '/users/[id]',
    });
  });

  it('preserves catch-all segments [...slug]', () => {
    expect(classifyPagesRouterFile('pages/blog/[...slug].tsx', 'pages')).toEqual({
      kind: 'route',
      route: '/blog/[...slug]',
    });
  });

  it('preserves optional catch-all segments [[...slug]]', () => {
    expect(classifyPagesRouterFile('pages/shop/[[...slug]].tsx', 'pages')).toEqual({
      kind: 'route',
      route: '/shop/[[...slug]]',
    });
  });

  it('works when the Pages Router root is src/pages', () => {
    expect(classifyPagesRouterFile('src/pages/index.tsx', 'src/pages')).toEqual({
      kind: 'route',
      route: '/',
    });
  });

  it('treats underscore files outside the Pages root as ordinary routes', () => {
    // Only top-level `_app`/`_document`/`_error` are special. A nested
    // underscore basename is a real route (matches Next.js behaviour).
    expect(classifyPagesRouterFile('pages/admin/_internal.tsx', 'pages')).toEqual({
      kind: 'route',
      route: '/admin/_internal',
    });
  });
});

describe('classifyPagesRouterFile — skipped', () => {
  it.each([
    ['pages/_app.tsx'],
    ['pages/_document.tsx'],
    ['pages/_error.tsx'],
    ['pages/_app.jsx'],
    ['pages/_app.ts'],
    ['pages/_app.js'],
  ])('skips top-level special file %s', (filePath) => {
    expect(classifyPagesRouterFile(filePath, 'pages')).toEqual({ kind: 'skip' });
  });

  it('skips api/* files even when the glob lets them through', () => {
    expect(classifyPagesRouterFile('pages/api/health.ts', 'pages')).toEqual({
      kind: 'skip',
    });
    expect(classifyPagesRouterFile('pages/api/users/[id].ts', 'pages')).toEqual({
      kind: 'skip',
    });
  });
});

describe('pagesPathToRoute', () => {
  it('returns / for an empty input after stripping index', () => {
    expect(pagesPathToRoute('index.tsx')).toBe('/');
  });

  it('drops the trailing index segment', () => {
    expect(pagesPathToRoute('users/index.tsx')).toBe('/users');
  });

  it('passes through dynamic segments untouched', () => {
    expect(pagesPathToRoute('users/[id].tsx')).toBe('/users/[id]');
    expect(pagesPathToRoute('blog/[...slug].tsx')).toBe('/blog/[...slug]');
    expect(pagesPathToRoute('shop/[[...slug]].tsx')).toBe('/shop/[[...slug]]');
  });
});
