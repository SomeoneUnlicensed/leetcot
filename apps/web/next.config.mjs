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
  ? withSentryConfig(
      baseConfig,
      {
        // For all available options, see:
        // https://github.com/getsentry/sentry-webpack-plugin#options

        // Suppresses source map uploading logs during build
        silent: true,

        org: process.env.SENTRY_ORG || 'typehero',
        project: process.env.SENTRY_PROJECT || 'typehero-web-production',
      },
      {
        // For all available options, see:
        // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

        // Upload a larger set of source maps for prettier stack traces (increases build time)
        widenClientFileUpload: true,

        // Transpiles SDK to be compatible with IE11 (increases bundle size)
        transpileClientSDK: true,

        // Hides source maps from generated client bundles
        hideSourceMaps: true,

        // Automatically tree-shake Sentry logger statements to reduce bundle size
        disableLogger: true,
      },
    )
  : baseConfig;
