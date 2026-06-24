// eslint-disable-next-line import/no-unresolved
import million from 'million/compiler';
import { withSentryConfig } from '@sentry/nextjs';

const millionConfig = {
  auto: { rsc: true },
};

/** @type {import("next").NextConfig} */
const config = {
  basePath: '/panel',
  webpack: (config) => {
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });
    return config;
  },
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  transpilePackages: ['@repo/db', '@repo/auth'],
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

const baseConfig = million.next(config, millionConfig);

export default process.env.SENTRY_AUTH_TOKEN
  ? withSentryConfig(baseConfig, {
      org: process.env.SENTRY_ORG || 'd97854546524',
      project: process.env.SENTRY_PROJECT || 'leetcot',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      silent: true,
      widenClientFileUpload: true,
      disableLogger: true,
    })
  : baseConfig;
