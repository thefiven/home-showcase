import { NextRequest, NextResponse } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";

/**
 * Le premier segment doit être un code de locale exact (`/fr`, `/en/...`) pour
 * être laissé passer : ceci garantit que `[locale]` ne reçoit jamais une valeur
 * hors de `locales` (cf. `apps/web/src/app/[locale]/layout.tsx`).
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
    // Toutes les routes sauf assets Next.js, fichiers statiques et favicon.
    "/((?!_next|api|favicon.ico|.*\\..*).*)",
  ],
};
