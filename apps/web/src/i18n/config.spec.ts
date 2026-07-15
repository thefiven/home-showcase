import { describe, expect, it } from "vitest";
import { isLocale, resolveLocale } from "./config";

describe("isLocale", () => {
  it.each(["fr", "en"])("reconnaît %s comme locale supportée", (value) => {
    expect(isLocale(value)).toBe(true);
  });

  it.each(["de", "fr-CA", "", "FR"])("rejette %s", (value) => {
    expect(isLocale(value)).toBe(false);
  });
});

describe("resolveLocale", () => {
  it("laisse passer une locale supportée", () => {
    expect(resolveLocale("en")).toBe("en");
  });

  it("replie sur defaultLocale pour une valeur inconnue (segment de route non fiable)", () => {
    expect(resolveLocale("de")).toBe("fr");
    expect(resolveLocale("")).toBe("fr");
  });
});
