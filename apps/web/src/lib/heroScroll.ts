const FADE_FRACTION = 0.7;
const MAX_SHIFT = 32;

export interface HeroScrollStyle {
  opacity: number;
  translateY: number;
}

/**
 * Calcule l'opacité et le décalage vertical du contenu du hero pendant le
 * scroll : entièrement visible en haut de page, estompé et légèrement
 * remonté avant que le hero ne quitte le viewport (`FADE_FRACTION` < 1).
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
