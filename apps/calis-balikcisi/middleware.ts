import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySessionToken } from '@/lib/admin-session';

const LOGIN_PATH = '/admin/giris';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authed = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
    process.env.ADMIN_PASSWORD,
  );

  let response: NextResponse;
  if (pathname === LOGIN_PATH) {
    response = authed
      ? NextResponse.redirect(new URL('/admin', request.url))
      : NextResponse.next();
  } else {
    response = authed
      ? NextResponse.next()
      : NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
