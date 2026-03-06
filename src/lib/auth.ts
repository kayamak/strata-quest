import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { getDb } from '@/lib/get-db';
import type { Session } from 'next-auth';
import { authConfig } from '@/lib/auth.config';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

const { providers: _, ...baseAuthConfig } = authConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(async () => {
  const db = await getDb();
  return {
    ...baseAuthConfig,
    adapter: DrizzleAdapter(db),
    providers: [
      Google({
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      }),
    ],
  };
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
  const db = await getDb();
  try {
    await db.insert(users).values({
      id: DEV_USER_ID,
      email: 'dev@example.com',
      name: 'Dev User',
    }).onConflictDoNothing();
  } catch (err) {
    // Ignore race condition errors
  }
}

export async function getSession(): Promise<Session | null> {
  if (process.env.OAUTH_SKIP === 'true') {
    await ensureDevUser();
    return devSession;
  }
  return auth();
}
