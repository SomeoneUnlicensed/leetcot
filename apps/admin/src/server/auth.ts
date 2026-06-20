import NextAuth, { type NextAuthConfig } from '@repo/auth/next-auth';

import { baseNextAuthConfig, createCredentialsProvider } from '@repo/auth/server';

const isProd = process.env.NODE_ENV === 'production';

export const authOptions: NextAuthConfig = {
  ...baseNextAuthConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret_key_12345',
  cookies: {
    sessionToken: {
      name: isProd ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sameSite: 'lax' as any,
        path: '/',
        secure: isProd,
      },
    },
  },
  providers: [createCredentialsProvider()],
};

export const { handlers, auth } = NextAuth(authOptions);
