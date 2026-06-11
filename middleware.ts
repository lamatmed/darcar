import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { jwtVerify } from 'jose';
import { getSuspendedHtml } from './lib/suspended';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // Suspension check
  if (process.env.APP_SUSPENDED === 'true') {
    return new NextResponse(getSuspendedHtml(), {
      status: 402,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  }

  const { pathname } = request.nextUrl;

  // 1. Logic for Protected Routes (Admin / Profile)
  const isProtectedPath = pathname.includes('/admin') || pathname.includes('/profile');
  
  if (isProtectedPath) {
    const token = request.cookies.get('rim_auth_token')?.value;

    if (!token) {
      const locale = pathname.split('/')[1] || 'fr';
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || "default-secret-key-change-it");
      const { payload } = await jwtVerify(token, secret);
      
      // Admin check for /admin routes
      if (pathname.includes('/admin') && payload.role !== 'ADMIN') {
        const locale = pathname.split('/')[1] || 'fr';
        return NextResponse.redirect(new URL(`/${locale}/`, request.url));
      }
    } catch (e) {
      const locale = pathname.split('/')[1] || 'fr';
      return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    }
  }

  // 2. Delegate to next-intl middleware
  return intlMiddleware(request);
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(ar|fr|en)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)']
};
