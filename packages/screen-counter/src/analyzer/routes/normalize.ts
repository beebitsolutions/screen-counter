import path from 'node:path';

/**
 * Force POSIX separators so output is portable across operating systems.
 */
export function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

/**
 * Build a POSIX, project-relative path from an absolute one.
 */
export function relativeFromRoot(rootDir: string, absPath: string): string {
  return toPosix(path.relative(rootDir, absPath));
}
