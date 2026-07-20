import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

/**
 * The first segment must be an exact locale code (`/fr`, `/en/...`) to be
 * let through: this guarantees `[locale]` never receives a value outside
 * of `locales` (see `apps/web/src/app/[locale]/layout.tsx`).
 */
export function pathnameHasLocale(pathname: string): boolean {
  const [, firstSegment] = pathname.split("/");
  return isLocale(firstSegment);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathnameHasLocale(pathname)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    // All routes except Next.js assets, static files, and favicon.
    "/((?!_next|api|favicon.ico|.*\\..*).*)",
  ],
};
