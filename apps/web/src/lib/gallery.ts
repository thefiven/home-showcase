import type { StrapiMedia } from "./strapi/types";

/** Nombre de petites tuiles affichées dans l'aperçu, en plus de la tuile héro. */
export const PREVIEW_TILE_COUNT = 4;

export interface GalleryPreview {
  cover: StrapiMedia | null;
  tiles: StrapiMedia[];
  hiddenCount: number;
}

/**
 * Découpe la liste de photos en aperçu grille (1 héro + N petites tuiles) et
 * calcule le nombre de photos non visibles dans cet aperçu (pour l'overlay
 * "Voir toutes les photos"). Ne fait aucune hypothèse sur l'ordre : la
 * première photo sert toujours de héro, comme dans l'ancien `PropertyGallery`.
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

/** Index suivant, cyclique (revient à 0 après la dernière photo). */
export function nextPhotoIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current + 1) % total;
}

/** Index précédent, cyclique (revient à la dernière photo avant la première). */
export function prevPhotoIndex(current: number, total: number): number {
  if (total <= 0) return 0;
  return (current - 1 + total) % total;
}
