import { describe, expect, it } from "vitest";
import { isLocale, resolveLocale } from "./config";

describe("isLocale", () => {
  it.each(["fr", "en"])("recognizes %s as a supported locale", (value) => {
    expect(isLocale(value)).toBe(true);
  });

  it.each(["de", "fr-CA", "", "FR"])("rejects %s", (value) => {
    expect(isLocale(value)).toBe(false);
  });
});

describe("resolveLocale", () => {
  it("passes through a supported locale", () => {
    expect(resolveLocale("en")).toBe("en");
  });

  it("falls back to defaultLocale for an unknown value (untrusted route segment)", () => {
    expect(resolveLocale("de")).toBe("fr");
    expect(resolveLocale("")).toBe("fr");
  });
});
