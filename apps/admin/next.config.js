// eslint-disable-next-line import/no-unresolved
import million from 'million/compiler';

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
export default million.next(config, millionConfig);
