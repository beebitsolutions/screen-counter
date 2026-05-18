import { describe, expect, it } from 'vitest';
import { classifyAppRouterFile } from './app-router.js';

describe('classifyAppRouterFile — routes', () => {
  it('should classify app/page.tsx as the root route /', () => {
    expect(classifyAppRouterFile('app/page.tsx', 'app')).toEqual({ kind: 'route', route: '/' });
  });

  it('should classify nested routes with their segments', () => {
    expect(classifyAppRouterFile('app/about/page.tsx', 'app')).toEqual({
      kind: 'route',
      route: '/about',
    });
  });

  it('should preserve dynamic segments [id], [...slug], [[...slug]]', () => {
    expect(classifyAppRouterFile('app/users/[id]/page.tsx', 'app')).toEqual({
      kind: 'route',
      route: '/users/[id]',
    });
    expect(classifyAppRouterFile('app/blog/[...slug]/page.tsx', 'app')).toEqual({
      kind: 'route',
      route: '/blog/[...slug]',
    });
    expect(classifyAppRouterFile('app/docs/[[...slug]]/page.tsx', 'app')).toEqual({
      kind: 'route',
      route: '/docs/[[...slug]]',
    });
  });

  it('should drop route groups (parentheses) from the URL but keep the page', () => {
    expect(classifyAppRouterFile('app/(marketing)/landing/page.tsx', 'app')).toEqual({
      kind: 'route',
      route: '/landing',
    });
  });

  it('should also work when the App Router root is src/app', () => {
    expect(classifyAppRouterFile('src/app/page.tsx', 'src/app')).toEqual({
      kind: 'route',
      route: '/',
    });
  });
});

describe('classifyAppRouterFile — skipped', () => {
  it('should skip parallel routes (@modal) with a warning', () => {
    const result = classifyAppRouterFile('app/@modal/page.tsx', 'app');
    expect(result.kind).toBe('skip');
    if (result.kind === 'skip') expect(result.warning).toMatch(/Parallel route/);
  });

  it('should skip intercepted routes (.)foo with a warning', () => {
    const result = classifyAppRouterFile('app/(.)photo/page.tsx', 'app');
    expect(result.kind).toBe('skip');
    if (result.kind === 'skip') expect(result.warning).toMatch(/Intercepted route/);
  });
});
