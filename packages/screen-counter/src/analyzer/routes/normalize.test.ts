import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { relativeFromRoot, toPosix } from './normalize.js';

describe('toPosix', () => {
  it('should convert platform-native separators to POSIX', () => {
    const native = ['app', 'users', '[id]', 'page.tsx'].join(path.sep);
    expect(toPosix(native)).toBe('app/users/[id]/page.tsx');
  });

  it('should leave POSIX paths unchanged', () => {
    expect(toPosix('app/users/page.tsx')).toBe('app/users/page.tsx');
  });
});

describe('relativeFromRoot', () => {
  it('should produce a POSIX relative path from an absolute one', () => {
    const root = path.resolve('/tmp', 'project');
    const abs = path.join(root, 'app', 'page.tsx');
    expect(relativeFromRoot(root, abs)).toBe('app/page.tsx');
  });
});
