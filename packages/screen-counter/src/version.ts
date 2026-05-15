/**
 * Package version. Single source of truth — bumped together with
 * `package.json` via changesets. Importing from a dedicated module keeps
 * the CLI bundle small and avoids dragging the analyzer barrel.
 */
export const VERSION = '0.0.0';
