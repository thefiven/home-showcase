import { describe, expect, it } from "vitest";
import { localizedAlternates, resolveSiteUrl } from "./site";

describe("resolveSiteUrl", () => {
  it("retombe sur localhost:3000 si NEXT_PUBLIC_SITE_URL est absent", () => {
    expect(resolveSiteUrl({})).toBe("http://localhost:3000");
  });

  it("utilise NEXT_PUBLIC_SITE_URL quand elle est définie", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://exemple.com" })).toBe(
      "https://exemple.com",
    );
  });

  it("retire le slash final", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://exemple.com/" })).toBe(
      "https://exemple.com",
    );
  });
});

describe("localizedAlternates", () => {
  const ENV = { NEXT_PUBLIC_SITE_URL: "https://exemple.com" };

  it("construit le canonical pour la locale courante et les alternates pour toutes les locales", () => {
    expect(localizedAlternates("fr", "/properties/loft", ENV)).toEqual({
      canonical: "https://exemple.com/fr/properties/loft",
      languages: {
        fr: "https://exemple.com/fr/properties/loft",
        en: "https://exemple.com/en/properties/loft",
      },
    });
  });

  it("gère le chemin racine (accueil)", () => {
    expect(localizedAlternates("en", "", ENV)).toEqual({
      canonical: "https://exemple.com/en",
      languages: {
        fr: "https://exemple.com/fr",
        en: "https://exemple.com/en",
      },
    });
  });
});
