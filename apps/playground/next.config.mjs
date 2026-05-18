import { withScreenCounter } from '@beebit/screen-counter/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@beebit/screen-counter'],
  // Allow Playwright E2E to boot multiple dev servers in parallel without
  // racing on a shared `.next` directory.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  // Next.js 16 blocks cross-origin requests to /_next/* (including the HMR
  // WebSocket) by default. Playwright connects via 127.0.0.1 while the dev
  // server typically registers as localhost, which trips that check and
  // prevents client bundles (and therefore React hydration) from loading.
  allowedDevOrigins: ['127.0.0.1', 'localhost'],
  // The Next 16 dev-tools indicator (bottom-left "N" button) injects extra
  // focusable elements that consume the tab budget in the badge keyboard e2e
  // test. The fixture/demo doesn't need it.
  devIndicators: false,
};

export default withScreenCounter({ verbose: true })(nextConfig);
