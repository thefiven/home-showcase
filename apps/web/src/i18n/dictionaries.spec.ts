import { describe, expect, it } from "vitest";
import { getDictionary } from "./dictionaries";
import { locales } from "./config";

describe("getDictionary", () => {
  it.each(locales)("retourne un dictionnaire complet pour la locale %s", (locale) => {
    const dictionary = getDictionary(locale);
    expect(dictionary.nav.siteTitle).toBeTruthy();
    expect(dictionary.properties.title).toBeTruthy();
    expect(dictionary.properties.empty).toBeTruthy();
  });

  it("fr et en exposent exactement les mêmes clés (pas de traduction manquante)", () => {
    const keysOf = (value: unknown, prefix = ""): string[] =>
      Object.entries(value as Record<string, unknown>).flatMap(([key, val]) =>
        typeof val === "object" && val !== null
          ? keysOf(val, `${prefix}${key}.`)
          : [`${prefix}${key}`],
      );

    expect(keysOf(getDictionary("en")).sort()).toEqual(keysOf(getDictionary("fr")).sort());
  });
});
