import { withScreenCounter } from '@beebit/screen-counter/plugin';

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@beebit/screen-counter'],
};

export default withScreenCounter({ verbose: true })(nextConfig);
