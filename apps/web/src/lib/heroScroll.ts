const FADE_FRACTION = 0.7;
const MAX_SHIFT = 32;

export interface HeroScrollStyle {
  opacity: number;
  translateY: number;
}

/**
 * Computes the opacity and vertical offset of the hero content during
 * scroll: fully visible at the top of the page, faded and slightly
 * shifted up before the hero leaves the viewport (`FADE_FRACTION` < 1).
 */
export function heroScrollStyle(
  scrollY: number,
  heroHeight: number,
  reducedMotion: boolean,
): HeroScrollStyle {
  const progress =
    heroHeight > 0 ? Math.min(Math.max(scrollY / (heroHeight * FADE_FRACTION), 0), 1) : 0;

  return {
    opacity: 1 - progress,
    translateY: reducedMotion ? 0 : progress * MAX_SHIFT,
  };
}
