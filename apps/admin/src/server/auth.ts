import NextAuth, { type NextAuthConfig } from '@repo/auth/next-auth';

import { baseNextAuthConfig, createCredentialsProvider, createGitHubProvider } from '@repo/auth/server';

const isProd = process.env.NODE_ENV === 'production';

const ALLOWED_GITHUB_LOGINS = (process.env.ADMIN_GITHUB_LOGINS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const providers = [createCredentialsProvider()];
if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(createGitHubProvider(process.env.GITHUB_ID, process.env.GITHUB_SECRET));
}

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
  providers,
  callbacks: {
    ...baseNextAuthConfig.callbacks,
    signIn: async (params) => {
      if (params.account?.provider === 'github') {
        const login = (params.profile as { login?: string } | undefined)?.login;
        if (!login || !ALLOWED_GITHUB_LOGINS.includes(login)) {
          return false;
        }
      }
      const base = baseNextAuthConfig.callbacks?.signIn;
      return base ? base(params) : true;
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const { handlers, auth } = NextAuth(authOptions) as any;
