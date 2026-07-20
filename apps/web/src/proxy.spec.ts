import { describe, expect, it } from "vitest";
import { pathnameHasLocale } from "./proxy";

describe("pathnameHasLocale", () => {
  it.each(["/fr", "/en", "/fr/properties", "/en/properties/loft-du-vieux-port"])(
    "recognizes a path already prefixed by a supported locale: %s",
    (pathname) => {
      expect(pathnameHasLocale(pathname)).toBe(true);
    },
  );

  it.each(["/", "/properties", "/fr-CA/properties", "/frx", "/de/properties"])(
    "rejects a path without a valid locale prefix: %s",
    (pathname) => {
      expect(pathnameHasLocale(pathname)).toBe(false);
    },
  );
});
