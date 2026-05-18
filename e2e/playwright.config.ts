import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, devices } from '@playwright/test';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE_ROOT = path.resolve(HERE, '..');

const IS_CI = !!process.env['CI'];
const PROJECT_FILTER = process.env['pwProjects'] ?? 'chromium';
const includeAllBrowsers = PROJECT_FILTER === 'all';

interface BadgeWebServer {
  port: number;
  env?: Record<string, string>;
}

const SERVERS: Record<string, BadgeWebServer> = {
  chromium: { port: 3000 },
  'show-never': { port: 3010, env: { NEXT_PUBLIC_SCREEN_COUNTER_SHOW: 'never' } },
  'limit-amber': { port: 3020, env: { NEXT_PUBLIC_SCREEN_COUNTER_LIMIT: '20' } },
  'limit-red': { port: 3021, env: { NEXT_PUBLIC_SCREEN_COUNTER_LIMIT: '10' } },
  'limit-green': { port: 3022, env: { NEXT_PUBLIC_SCREEN_COUNTER_LIMIT: '100' } },
};

function buildWebServer(name: string, server: BadgeWebServer) {
  return {
    command: `pnpm --filter playground exec next dev --port ${server.port}`,
    cwd: WORKSPACE_ROOT,
    url: `http://127.0.0.1:${server.port}`,
    timeout: 180_000,
    reuseExistingServer: !IS_CI,
    env: {
      NEXT_DIST_DIR: `.next-e2e/${name}`,
      ...(server.env ?? {}),
    },
    stdout: 'pipe' as const,
    stderr: 'pipe' as const,
  };
}

function buildProject(name: keyof typeof SERVERS) {
  const server = SERVERS[name]!;
  return {
    name,
    use: {
      ...devices['Desktop Chrome'],
      baseURL: `http://127.0.0.1:${server.port}`,
    },
  };
}

const baseProjects = [
  buildProject('chromium'),
  buildProject('show-never'),
  buildProject('limit-amber'),
  buildProject('limit-red'),
  buildProject('limit-green'),
];

const extraBrowserProjects = includeAllBrowsers
  ? [
      { name: 'firefox', use: { ...devices['Desktop Firefox'], baseURL: 'http://127.0.0.1:3000' } },
      { name: 'webkit', use: { ...devices['Desktop Safari'], baseURL: 'http://127.0.0.1:3000' } },
    ]
  : [];

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: IS_CI,
  retries: IS_CI ? 1 : 0,
  workers: IS_CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'on-first-retry',
  },
  webServer: Object.entries(SERVERS).map(([name, server]) => buildWebServer(name, server)),
  projects: [...baseProjects, ...extraBrowserProjects],
});
