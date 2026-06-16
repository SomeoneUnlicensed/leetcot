import NextAuth from '@repo/auth/next-auth';

import { baseNextAuthConfig, createCredentialsProvider } from '@repo/auth/server';

const useSecureCookies = process.env.VERCEL_ENV === 'production';
const cookiePrefix = useSecureCookies ? '__Secure-' : '';
const cookieDomain = useSecureCookies ? 'leetcot.ru' : undefined;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authOptions: any = {
  ...baseNextAuthConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret_key_12345',
  cookies: {
    sessionToken: {
      name: `${cookiePrefix}next-auth.session-token`,
      options: {
        httpOnly: true,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sameSite: 'lax' as any,
        path: '/',
        domain: cookieDomain,
        secure: useSecureCookies,
      },
    },
  },
  providers: [createCredentialsProvider()],
};

export const { handlers, auth } = NextAuth(authOptions);
