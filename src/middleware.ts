import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'nl'],
  defaultLocale: 'nl',
  localeDetection: true,
});

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
