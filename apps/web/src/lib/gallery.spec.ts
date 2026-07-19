import { describe, expect, it } from "vitest";
import { buildGalleryPreview, nextPhotoIndex, prevPhotoIndex } from "./gallery";
import type { StrapiMedia } from "./strapi/types";

function photo(id: number): StrapiMedia {
  return { id, documentId: `doc-${id}`, url: `/photo-${id}.jpg` };
}

describe("buildGalleryPreview", () => {
  it("retourne un aperçu vide sans photo", () => {
    expect(buildGalleryPreview(null)).toEqual({ cover: null, tiles: [], hiddenCount: 0 });
    expect(buildGalleryPreview(undefined)).toEqual({ cover: null, tiles: [], hiddenCount: 0 });
    expect(buildGalleryPreview([])).toEqual({ cover: null, tiles: [], hiddenCount: 0 });
  });

  it("n'a pas de tuile ni de photo cachée avec une seule photo", () => {
    const photos = [photo(1)];
    expect(buildGalleryPreview(photos)).toEqual({ cover: photo(1), tiles: [], hiddenCount: 0 });
  });

  it("place toutes les photos restantes en tuiles quand il y en a 5 ou moins", () => {
    const photos = [photo(1), photo(2), photo(3), photo(4), photo(5)];
    const preview = buildGalleryPreview(photos);
    expect(preview.cover).toEqual(photo(1));
    expect(preview.tiles).toEqual([photo(2), photo(3), photo(4), photo(5)]);
    expect(preview.hiddenCount).toBe(0);
  });

  it("calcule le nombre de photos cachées au-delà de la grille d'aperçu", () => {
    const photos = Array.from({ length: 8 }, (_, index) => photo(index + 1));
    const preview = buildGalleryPreview(photos);
    expect(preview.cover).toEqual(photo(1));
    expect(preview.tiles).toEqual([photo(2), photo(3), photo(4), photo(5)]);
    expect(preview.hiddenCount).toBe(3);
  });
});

describe("nextPhotoIndex", () => {
  it("avance d'un index", () => {
    expect(nextPhotoIndex(0, 3)).toBe(1);
    expect(nextPhotoIndex(1, 3)).toBe(2);
  });

  it("boucle sur le début après la dernière photo", () => {
    expect(nextPhotoIndex(2, 3)).toBe(0);
  });

  it("reste sur place quand il n'y a qu'une seule photo", () => {
    expect(nextPhotoIndex(0, 1)).toBe(0);
  });

  it("retourne 0 quand il n'y a aucune photo", () => {
    expect(nextPhotoIndex(0, 0)).toBe(0);
  });
});

describe("prevPhotoIndex", () => {
  it("recule d'un index", () => {
    expect(prevPhotoIndex(2, 3)).toBe(1);
    expect(prevPhotoIndex(1, 3)).toBe(0);
  });

  it("boucle sur la fin avant la première photo", () => {
    expect(prevPhotoIndex(0, 3)).toBe(2);
  });

  it("reste sur place quand il n'y a qu'une seule photo", () => {
    expect(prevPhotoIndex(0, 1)).toBe(0);
  });

  it("retourne 0 quand il n'y a aucune photo", () => {
    expect(prevPhotoIndex(0, 0)).toBe(0);
  });
});
