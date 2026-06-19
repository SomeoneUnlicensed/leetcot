import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Role, RoleTypes, User } from '@repo/db/types';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { CredentialsSignin } from 'next-auth';
import type { OAuthConfig } from 'next-auth/providers';
import { prisma } from '@repo/db';
import type { NextAuthConfig } from 'next-auth';
import bcrypt from 'bcryptjs';

class ArlistRequiredError extends CredentialsSignin {
  code = 'ArlistRequired';
}

export type { Session, DefaultSession as DefaultAuthSession } from 'next-auth';

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session {
    user: User & { role: RoleTypes[] };
  }
}

declare module '@auth/core/adapters' {
  interface AdapterUser extends User {
    roles: Role[];
  }
}

export const baseNextAuthConfig: Omit<NextAuthConfig, 'providers'> = {
  trustHost: true,
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  adapter: {
    ...PrismaAdapter(prisma),
    // Override createUser method to add default USER role
    createUser: async (data) => {
      const user = await prisma.user.create({
        data: {
          ...data,
          name: data.name ?? '',
          roles: {
            connectOrCreate: {
              where: { role: 'USER' },
              create: { role: 'USER' },
            },
          },
        },
        include: { roles: true },
      });
      return user;
    },
    // Override getSessionAndUser method to include roles. Avoids a second db query in session callback
    getSessionAndUser: async (sessionToken) => {
      const userAndSession = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: { include: { roles: true } } },
      });
      if (!userAndSession) return null;
      const { user, ...session } = userAndSession;
      return { user, session };
    },
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        const u = await prisma.user.findUnique({
          where: { id: user.id },
          include: { roles: true },
        });
        if (u) {
          token.id = u.id;
          token.roles = u.roles.map((r) => r.role);
        }
      }
      return token;
    },
    session: ({ session, token }) => {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.role = token.roles as RoleTypes[];
      }
      return session;
    },
  },
};

export const createCredentialsProvider = () => {
  return CredentialsProvider({
    name: 'Кошачий вход',
    credentials: {
      email: { label: 'Email', type: 'email', placeholder: 'мяу@example.com' },
      password: { label: 'Пароль', type: 'password' },
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null;

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
        include: { accounts: true },
      });

      if (!user) return null;

      // If the user has linked an Arlist account, block password login
      const hasArlist = user.accounts.some((a) => a.provider === 'arlist');
      if (hasArlist) throw new ArlistRequiredError();

      if (!user.password) return null;

      const isPasswordValid = await bcrypt.compare(credentials.password as string, user.password);
      if (!isPasswordValid) return null;

      return {
        id: user.id,
        email: user.email,
        name: user.name,
      };
    },
  });
};

interface ArlistProfile {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  role?: string;
  isVerified?: boolean;
}

export const createArlistProvider = (clientId: string, clientSecret: string): OAuthConfig<ArlistProfile> => {
  return {
    id: 'arlist',
    name: 'Arlist ID',
    type: 'oauth',
    clientId,
    clientSecret,
    issuer: 'https://arlist.ru',
    allowDangerousEmailAccountLinking: true,
    authorization: {
      url: 'https://arlist.ru/auth',
      params: { scope: 'openid email profile', response_type: 'code' },
    },
    token: 'https://arlist.ru/token',
    userinfo: 'https://arlist.ru/me',
    checks: ['pkce', 'state'],
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name ?? '',
        email: profile.email,
        image: profile.picture ?? null,
      };
    },
  };
};

export const createGitHubProvider = (clientId: string, clientSecret: string) => {
  return GitHubProvider({
    clientId,
    clientSecret,
    profile: (p) => ({
      id: p.id.toString(),
      name: p.login,
      email: p.email,
      image: p.avatar_url,
    }),
  });
};
