import { describe, expect, it } from 'vitest';
import { discoverPagesRouterRoutes } from './pages-router.js';

describe('discoverPagesRouterRoutes (v0.x stub)', () => {
  it('should resolve to empty routes + warnings (decision pending, see preguntas §3)', async () => {
    const result = await discoverPagesRouterRoutes('/tmp/whatever', 'pages');
    expect(result).toEqual({ routes: [], warnings: [] });
  });
});
