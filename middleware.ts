import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE = '__auth_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Proteger todas las rutas /admin/*
  if (pathname.startsWith('/admin')) {
    const session = request.cookies.get(SESSION_COOKIE);

    if (!session?.value) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
