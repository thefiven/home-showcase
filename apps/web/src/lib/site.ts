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
 * URL publique absolue du site, utilisée pour `metadataBase`, le sitemap,
 * robots.txt et les URLs canoniques. Repli `localhost:3000` en dev quand
 * `NEXT_PUBLIC_SITE_URL` n'est pas défini (jamais en production).
 */
export function resolveSiteUrl(env: SiteEnv = currentEnv()): string {
  const url = env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return stripTrailingSlash(url);
}

/**
 * Construit `alternates.canonical`/`alternates.languages` pour une page,
 * étant donné sa `locale` courante et son chemin sans préfixe de locale
 * (ex. `""` pour l'accueil, `"/properties"`, `"/properties/mon-logement"`).
 * Les slugs de logement ne sont pas localisés côté Strapi (même chemin pour
 * toutes les locales), donc une correspondance directe locale → chemin suffit.
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
