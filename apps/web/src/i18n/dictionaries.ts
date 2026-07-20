import type { Locale } from "./config";
import fr from "./dictionaries/fr.json";
import en from "./dictionaries/en.json";

export type Dictionary = typeof fr;

const dictionaries: Record<Locale, Dictionary> = { fr, en };

/** Dictionary of the site's chrome strings (nav, titles, empty states) for a locale. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
