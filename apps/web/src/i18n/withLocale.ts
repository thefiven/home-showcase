import type { Locale } from "./config";

/** Remplace le segment de locale en tête d'un chemin, en conservant le reste de l'URL. */
export function withLocale(pathname: string, locale: Locale): string {
  const segments = pathname.split("/");
  segments[1] = locale;
  return segments.join("/") || "/";
}
