/** Locales supportées par le site, alignées sur les locales Strapi (`apps/cms/src/bootstrap.ts`). */
export const locales = ["fr", "en"] as const;

export type Locale = (typeof locales)[number];

/** Locale de référence : même valeur que `DEFAULT_LOCALE_CODE` côté Strapi. */
export const defaultLocale: Locale = "fr";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/**
 * Route un segment de locale brut (typé `string` par Next.js — n'importe quelle
 * valeur peut apparaître dans l'URL) vers une `Locale` connue, avec repli sur
 * `defaultLocale`. Le middleware garantit déjà ce repli en amont ; ceci couvre
 * aussi les cas où une route est atteinte sans passer par le middleware.
 */
export function resolveLocale(value: string): Locale {
  return isLocale(value) ? value : defaultLocale;
}
