import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import Google from 'next-auth/providers/google';
import { prisma } from '@/lib/prisma';
import type { Session } from 'next-auth';
import type { Prisma } from '@prisma/client';
import { authConfig } from '@/lib/auth.config';

const { providers: _, ...baseAuthConfig } = authConfig;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...baseAuthConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
});

const DEV_USER_ID = 'dev-skip-auth';

const devSession: Session = {
  user: {
    id: DEV_USER_ID,
    name: 'Dev User',
    email: 'dev@example.com',
    image: null,
  },
  expires: new Date(Date.now() + 86400 * 1000).toISOString(),
};

async function ensureDevUser(): Promise<void> {
  const data: Prisma.UserCreateInput = {
    id: DEV_USER_ID,
    email: 'dev@example.com',
    name: 'Dev User',
  };
  await prisma.user.upsert({
    where: { id: DEV_USER_ID },
    update: {},
    create: data,
  });
}

export async function getSession(): Promise<Session | null> {
  if (process.env.OAUTH_SKIP === 'true') {
    await ensureDevUser();
    return devSession;
  }
  return auth();
}
