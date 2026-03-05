import NextAuth from 'next-auth';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { authConfig } from '@/lib/auth.config';

const { auth } = NextAuth(authConfig);

export async function middleware(request: NextRequest) {
  if (process.env.OAUTH_SKIP === 'true') {
    return NextResponse.next();
  }
  return (auth as unknown as (req: NextRequest) => Promise<Response>)(request);
}

export const config = {
  matcher: ['/profile/:path*', '/quests/:path*', '/vocabulary/:path*'],
};
