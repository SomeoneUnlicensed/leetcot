import NextAuth from '@repo/auth/next-auth';

import { baseNextAuthConfig, createCredentialsProvider, createParticipantCodeProvider } from '@repo/auth/server';

const isProd = process.env.NODE_ENV === 'production';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authOptions: any = {
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
  providers: [createParticipantCodeProvider(), createCredentialsProvider()],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const { handlers, auth } = NextAuth(authOptions) as any;
