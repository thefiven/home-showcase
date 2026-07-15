import { describe, expect, it } from "vitest";
import { withLocale } from "./withLocale";

describe("withLocale", () => {
  it("remplace le segment de locale en préservant le reste du chemin", () => {
    expect(withLocale("/fr/properties/loft-du-vieux-port", "en")).toBe(
      "/en/properties/loft-du-vieux-port",
    );
  });

  it("fonctionne sur la page d'accueil localisée", () => {
    expect(withLocale("/fr", "en")).toBe("/en");
  });

  it("bascule vers la même locale sans effet de bord", () => {
    expect(withLocale("/en/properties", "en")).toBe("/en/properties");
  });
});
