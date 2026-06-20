import NextAuth from '@repo/auth/next-auth';

import { baseNextAuthConfig, createArlistProvider, createCredentialsProvider } from '@repo/auth/server';
import { prisma } from '@repo/db';
import { sendArlistLinkedEmail } from '~/lib/mailer';

const isProd = process.env.NODE_ENV === 'production';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const authOptions: any = {
  ...baseNextAuthConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'fallback_secret_key_12345',
  events: {
    linkAccount: async ({
      user,
      account,
    }: {
      user: { id: string; email?: string | null; name?: string | null };
      account: { provider: string };
    }) => {
      if (account.provider === 'arlist') {
        await prisma.user.update({
          where: { id: user.id },
          data: { arlistLinkedNotifiedAt: new Date() },
        });
        if (user.email) {
          try {
            await sendArlistLinkedEmail(user.email, user.name ?? '');
          } catch (error) {
            console.error('Failed to send Arlist linked email', error);
          }
        }
      }
    },
  },
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
  providers: [
    ...(process.env.ARLIST_CLIENT_ID && process.env.ARLIST_CLIENT_SECRET
      ? [createArlistProvider(process.env.ARLIST_CLIENT_ID, process.env.ARLIST_CLIENT_SECRET)]
      : []),
    createCredentialsProvider(),
  ],
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const { handlers, auth } = NextAuth(authOptions) as any;
