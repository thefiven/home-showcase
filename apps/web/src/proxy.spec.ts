import { describe, expect, it } from "vitest";
import { pathnameHasLocale } from "./proxy";

describe("pathnameHasLocale", () => {
  it.each(["/fr", "/en", "/fr/properties", "/en/properties/loft-du-vieux-port"])(
    "reconnaît un chemin déjà préfixé par une locale supportée : %s",
    (pathname) => {
      expect(pathnameHasLocale(pathname)).toBe(true);
    },
  );

  it.each(["/", "/properties", "/fr-CA/properties", "/frx", "/de/properties"])(
    "rejette un chemin sans préfixe de locale valide : %s",
    (pathname) => {
      expect(pathnameHasLocale(pathname)).toBe(false);
    },
  );
});
