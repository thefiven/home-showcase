import { describe, expect, it } from "vitest";
import { heroScrollStyle } from "./heroScroll";

describe("heroScrollStyle", () => {
  it("is fully visible without scroll", () => {
    expect(heroScrollStyle(0, 800, false)).toEqual({ opacity: 1, translateY: 0 });
  });

  it("is fully faded at the fade threshold (heroHeight * 0.7)", () => {
    expect(heroScrollStyle(560, 800, false)).toEqual({ opacity: 0, translateY: 32 });
  });

  it("stays clamped beyond the threshold (no negative opacity or excessive translation)", () => {
    expect(heroScrollStyle(2000, 800, false)).toEqual({ opacity: 0, translateY: 32 });
  });

  it("interpolates at the midpoint", () => {
    const style = heroScrollStyle(280, 800, false);
    expect(style.opacity).toBeCloseTo(0.5);
    expect(style.translateY).toBeCloseTo(16);
  });

  it("disables translation under prefers-reduced-motion without changing opacity", () => {
    const style = heroScrollStyle(280, 800, true);
    expect(style.opacity).toBeCloseTo(0.5);
    expect(style.translateY).toBe(0);
  });

  it("stays visible and static while the hero height hasn't been measured yet", () => {
    expect(heroScrollStyle(200, 0, false)).toEqual({ opacity: 1, translateY: 0 });
  });
});
