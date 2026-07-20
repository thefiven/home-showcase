/** Locales supported by the site, aligned with the Strapi locales (`apps/cms/src/bootstrap.ts`). */
export const locales = ["fr", "en"] as const;

export type Locale = (typeof locales)[number];

/** Reference locale: same value as `DEFAULT_LOCALE_CODE` on the Strapi side. */
export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Routes a raw locale segment (typed `string` by Next.js — any value can
 * appear in the URL) to a known `Locale`, falling back to `defaultLocale`.
 * The middleware already guarantees this fallback upstream; this also
 * covers cases where a route is reached without going through the
 * middleware.
 */
export function resolveLocale(value: string): Locale {
  return isLocale(value) ? value : defaultLocale;
}
