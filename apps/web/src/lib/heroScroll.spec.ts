import { describe, expect, it } from "vitest";
import { heroScrollStyle } from "./heroScroll";

describe("heroScrollStyle", () => {
  it("est entièrement visible sans scroll", () => {
    expect(heroScrollStyle(0, 800, false)).toEqual({ opacity: 1, translateY: 0 });
  });

  it("est entièrement estompé au seuil de fondu (heroHeight * 0.7)", () => {
    expect(heroScrollStyle(560, 800, false)).toEqual({ opacity: 0, translateY: 32 });
  });

  it("reste clampé au-delà du seuil (pas d'opacité négative ni de translation excessive)", () => {
    expect(heroScrollStyle(2000, 800, false)).toEqual({ opacity: 0, translateY: 32 });
  });

  it("interpole à mi-parcours", () => {
    const style = heroScrollStyle(280, 800, false);
    expect(style.opacity).toBeCloseTo(0.5);
    expect(style.translateY).toBeCloseTo(16);
  });

  it("désactive la translation en prefers-reduced-motion sans changer l'opacité", () => {
    const style = heroScrollStyle(280, 800, true);
    expect(style.opacity).toBeCloseTo(0.5);
    expect(style.translateY).toBe(0);
  });

  it("reste visible et immobile tant que la hauteur du hero n'est pas mesurée", () => {
    expect(heroScrollStyle(200, 0, false)).toEqual({ opacity: 1, translateY: 0 });
  });
});
