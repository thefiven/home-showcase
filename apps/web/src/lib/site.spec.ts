import { describe, expect, it } from "vitest";
import { localizedAlternates, resolveSiteUrl } from "./site";

describe("resolveSiteUrl", () => {
  it("falls back to localhost:3000 if NEXT_PUBLIC_SITE_URL is absent", () => {
    expect(resolveSiteUrl({})).toBe("http://localhost:3000");
  });

  it("uses NEXT_PUBLIC_SITE_URL when it is defined", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://exemple.com" })).toBe(
      "https://exemple.com",
    );
  });

  it("strips the trailing slash", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://exemple.com/" })).toBe(
      "https://exemple.com",
    );
  });
});

describe("localizedAlternates", () => {
  const ENV = { NEXT_PUBLIC_SITE_URL: "https://exemple.com" };

  it("builds the canonical for the current locale and the alternates for every locale", () => {
    expect(localizedAlternates("fr", "/properties/loft", ENV)).toEqual({
      canonical: "https://exemple.com/fr/properties/loft",
      languages: {
        fr: "https://exemple.com/fr/properties/loft",
        en: "https://exemple.com/en/properties/loft",
      },
    });
  });

  it("handles the root path (home)", () => {
    expect(localizedAlternates("en", "", ENV)).toEqual({
      canonical: "https://exemple.com/en",
      languages: {
        fr: "https://exemple.com/fr",
        en: "https://exemple.com/en",
      },
    });
  });
});
