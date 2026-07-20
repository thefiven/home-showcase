import type { Locale } from "./config";

/** Replaces the locale segment at the start of a path, keeping the rest of the URL. */
export function withLocale(pathname: string, locale: Locale): string {
  const segments = pathname.split("/");
  segments[1] = locale;
  return segments.join("/") || "/";
}
