// NOTE: million/compiler is webpack-only and incompatible with turbopack.
// In dev (turbopack) we skip it; in production builds webpack is used so million is applied.
import bundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
// eslint-disable-next-line import/no-unresolved
import vercelToolbar from '@vercel/toolbar/plugins/next';
// eslint-disable-next-line import/no-unresolved
import million from 'million/compiler';

const millionConfig = {
  auto: { rsc: true },
};
const isProd = process.env.NODE_ENV === 'production';
// Detect turbopack mode via CLI args (--turbopack flag)
const isTurbopack = process.argv.includes('--turbopack');

const nextConfig = {
  async headers() {
    return !isProd
      ? [
          {
            // allow CORS only on dev for admin site to get monaco files
            source: '/min/vs/(.*)',
            headers: [{ key: 'Access-Control-Allow-Origin', value: '*' }],
          },
        ]
      : [];
  },
  async redirects() {
    return [];
  },
  async rewrites() {
    return [
      {
        source: '/panel',
        destination: 'http://localhost:3001/panel',
      },
      {
        source: '/panel/:path*',
        destination: 'http://localhost:3001/panel/:path*',
      },
    ];
  },
  transpilePackages: ['@repo/db', '@repo/ui', '@repo/auth', '@repo/monaco'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
      },
    ],
  },
};

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});
const withVercelToolbar = vercelToolbar();

// In turbopack (dev) mode: skip million compiler (webpack-only)
/** @param {any} config */
const withPlugins = (config) =>
  isTurbopack
    ? withBundleAnalyzer(withVercelToolbar(config))
    : million.next(withBundleAnalyzer(withVercelToolbar(config)), millionConfig);

const baseConfig = withPlugins(nextConfig);

export default process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(baseConfig, {
      org: process.env.SENTRY_ORG || 'typehero',
      project: process.env.SENTRY_PROJECT || 'typehero-web-production',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: true,
      widenClientFileUpload: true,
      disableLogger: true,
    })
  : baseConfig;
