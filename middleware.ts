import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from '@/lib/auth';

const PUBLIC_PATHS = [
  '/login',
  '/api/auth',
  '/api/session',
  '/api/matches',
  '/api/predictions',
  '/api/standings',
  '/api/admin/users',
  '/api/admin/sync',
  '/api/admin/sync-info',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get('session')?.value;

  if (!sessionToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const session = await verifySession(sessionToken);

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};