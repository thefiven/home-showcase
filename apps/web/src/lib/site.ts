import { locales, type Locale } from "@/i18n/config";

interface SiteEnv {
  NEXT_PUBLIC_SITE_URL?: string;
}

function currentEnv(): SiteEnv {
  return process.env as SiteEnv;
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Absolute public site URL, used for `metadataBase`, the sitemap,
 * robots.txt, and canonical URLs. Falls back to `localhost:3000` in dev
 * when `NEXT_PUBLIC_SITE_URL` is not set (never in production).
 */
export function resolveSiteUrl(env: SiteEnv = currentEnv()): string {
  const url = env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return stripTrailingSlash(url);
}

/**
 * Builds `alternates.canonical`/`alternates.languages` for a page, given
 * its current `locale` and its path without the locale prefix
 * (e.g. `""` for the homepage, `"/properties"`, `"/properties/my-property"`).
 * Property slugs are not localized on the Strapi side (same path for all
 * locales), so a direct locale → path mapping is enough.
 */
export function localizedAlternates(
  locale: Locale,
  path: string,
  env: SiteEnv = currentEnv(),
): { canonical: string; languages: Record<string, string> } {
  const siteUrl = resolveSiteUrl(env);
  const normalizedPath = path.startsWith("/") ? path : path ? `/${path}` : "";

  const languages = Object.fromEntries(
    locales.map((loc) => [loc, `${siteUrl}/${loc}${normalizedPath}`]),
  );

  return {
    canonical: languages[locale],
    languages,
  };
}
