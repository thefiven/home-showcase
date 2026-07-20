import type { StrapiMedia } from "./strapi/types";

/** Number of small tiles shown in the preview, in addition to the hero tile. */
export const PREVIEW_TILE_COUNT = 4;

export interface GalleryPreview {
  cover: StrapiMedia | null;
  tiles: StrapiMedia[];
  hiddenCount: number;
}

/**
 * Splits the photo list into a grid preview (1 hero + N small tiles) and
 * computes the number of photos not shown in this preview (for the
 * "View all photos" overlay). Makes no assumption about ordering: the
 * first photo always serves as the hero, as in the old `PropertyGallery`.
 */
export function buildGalleryPreview(photos?: StrapiMedia[] | null): GalleryPreview {
  if (!photos || photos.length === 0) {
    return { cover: null, tiles: [], hiddenCount: 0 };
  }

  const [cover, ...rest] = photos;
  const tiles = rest.slice(0, PREVIEW_TILE_COUNT);
  const hiddenCount = Math.max(0, rest.length - PREVIEW_TILE_COUNT);

  return { cover, tiles, hiddenCount };
}

/** Next index, cyclic (wraps to 0 after the last photo). */
export function nextPhotoIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current + 1) % total;
}

/** Previous index, cyclic (wraps to the last photo before the first). */
export function prevPhotoIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current - 1 + total) % total;
}
