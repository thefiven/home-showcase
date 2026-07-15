import type { Locale } from "./config";
import fr from "./dictionaries/fr.json";
import en from "./dictionaries/en.json";

export type Dictionary = typeof fr;

const dictionaries: Record<Locale, Dictionary> = { fr, en };

/** Dictionnaire des chaînes d'habillage du site (nav, titres, états vides) pour une locale. */
export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
