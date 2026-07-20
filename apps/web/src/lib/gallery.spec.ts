import { describe, expect, it } from "vitest";
import { buildGalleryPreview, nextPhotoIndex, prevPhotoIndex } from "./gallery";
import type { StrapiMedia } from "./strapi/types";

function photo(id: number): StrapiMedia {
  return { id, documentId: `doc-${id}`, url: `/photo-${id}.jpg` };
}

describe("buildGalleryPreview", () => {
  it("returns an empty preview without a photo", () => {
    expect(buildGalleryPreview(null)).toEqual({ cover: null, tiles: [], hiddenCount: 0 });
    expect(buildGalleryPreview(undefined)).toEqual({ cover: null, tiles: [], hiddenCount: 0 });
    expect(buildGalleryPreview([])).toEqual({ cover: null, tiles: [], hiddenCount: 0 });
  });

  it("has no tile or hidden photo with a single photo", () => {
    const photos = [photo(1)];
    expect(buildGalleryPreview(photos)).toEqual({ cover: photo(1), tiles: [], hiddenCount: 0 });
  });

  it("places all remaining photos as tiles when there are 5 or fewer", () => {
    const photos = [photo(1), photo(2), photo(3), photo(4), photo(5)];
    const preview = buildGalleryPreview(photos);
    expect(preview.cover).toEqual(photo(1));
    expect(preview.tiles).toEqual([photo(2), photo(3), photo(4), photo(5)]);
    expect(preview.hiddenCount).toBe(0);
  });

  it("computes the number of hidden photos beyond the preview grid", () => {
    const photos = Array.from({ length: 8 }, (_, index) => photo(index + 1));
    const preview = buildGalleryPreview(photos);
    expect(preview.cover).toEqual(photo(1));
    expect(preview.tiles).toEqual([photo(2), photo(3), photo(4), photo(5)]);
    expect(preview.hiddenCount).toBe(3);
  });
});

describe("nextPhotoIndex", () => {
  it("advances by one index", () => {
    expect(nextPhotoIndex(0, 3)).toBe(1);
    expect(nextPhotoIndex(1, 3)).toBe(2);
  });

  it("loops back to the start after the last photo", () => {
    expect(nextPhotoIndex(2, 3)).toBe(0);
  });

  it("stays put when there is only one photo", () => {
    expect(nextPhotoIndex(0, 1)).toBe(0);
  });

  it("returns 0 when there is no photo", () => {
    expect(nextPhotoIndex(0, 0)).toBe(0);
  });
});

describe("prevPhotoIndex", () => {
  it("goes back by one index", () => {
    expect(prevPhotoIndex(2, 3)).toBe(1);
    expect(prevPhotoIndex(1, 3)).toBe(0);
  });

  it("loops back to the end before the first photo", () => {
    expect(prevPhotoIndex(0, 3)).toBe(2);
  });

  it("stays put when there is only one photo", () => {
    expect(prevPhotoIndex(0, 1)).toBe(0);
  });

  it("returns 0 when there is no photo", () => {
    expect(prevPhotoIndex(0, 0)).toBe(0);
  });
});
