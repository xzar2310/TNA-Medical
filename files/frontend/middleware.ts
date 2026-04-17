import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'th'];
const defaultLocale = 'en';

// Routes that require authentication
const protectedPatterns = ['/account', '/admin'];
// Routes that require admin role (enforced server-side in layout too)
const adminPatterns = ['/admin'];
// Auth routes — redirect to home if already logged in
const authPatterns = ['/login', '/register'];

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always',
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix to check route type
  const pathnameWithoutLocale = pathname.replace(/^\/(en|th)/, '') || '/';

  // Check if route is protected
  const isProtected = protectedPatterns.some((p) =>
    pathnameWithoutLocale.startsWith(p)
  );

  if (isProtected) {
    // Read session token set by NextAuth
    const token =
      request.cookies.get('next-auth.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value;

    if (!token) {
      // Redirect unauthenticated users to the localized login page
      const locale = pathname.split('/')[1] || defaultLocale;
      const loginUrl = new URL(`/${locale}/login`, request.url);
      loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Apply next-intl routing for all other requests
  return intlMiddleware(request);
}

export const config = {
  // Match all pathnames except internals (_next, api, static files)
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
