import type { MetadataRoute } from "next";
import { locales } from "@/i18n/config";
import { getAllSlugs } from "@/lib/strapi/client";
import { resolveSiteUrl } from "@/lib/site";

/** Static paths (without locale prefix) included in the sitemap. */
const STATIC_PATHS = ["", "/properties"];

function languageAlternates(siteUrl: string, path: string): Record<string, string> {
  return Object.fromEntries(locales.map((locale) => [locale, `${siteUrl}/${locale}${path}`]));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = resolveSiteUrl();
  const slugs = await getAllSlugs();
  const paths = [...STATIC_PATHS, ...slugs.map((slug) => `/properties/${slug}`)];

  return locales.flatMap((locale) =>
    paths.map((path) => ({
      url: `${siteUrl}/${locale}${path}`,
      alternates: { languages: languageAlternates(siteUrl, path) },
    })),
  );
}
