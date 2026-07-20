import { describe, expect, it } from "vitest";
import { withLocale } from "./withLocale";

describe("withLocale", () => {
  it("replaces the locale segment while preserving the rest of the path", () => {
    expect(withLocale("/fr/properties/loft-du-vieux-port", "en")).toBe(
      "/en/properties/loft-du-vieux-port",
    );
  });

  it("works on the localized home page", () => {
    expect(withLocale("/fr", "en")).toBe("/en");
  });

  it("switches to the same locale without side effects", () => {
    expect(withLocale("/en/properties", "en")).toBe("/en/properties");
  });
});
