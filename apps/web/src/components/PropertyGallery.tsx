import { mediaUrl } from "@/lib/strapi/client";
import { buildGalleryPreview } from "@/lib/gallery";
import type { StrapiMedia } from "@/lib/strapi/types";
import { GalleryClient, type ResolvedPhoto } from "@/components/GalleryClient";
import type { Dictionary } from "@/i18n/dictionaries";

function resolvePhoto(photo: StrapiMedia, alt: string): ResolvedPhoto {
  return {
    id: photo.id,
    src: mediaUrl(photo.url)!,
    alt: photo.alternativeText || alt,
  };
}

/**
 * Resolves media URLs server-side (`mediaUrl` depends on
 * `STRAPI_INTERNAL_URL`, a server-only variable) before passing them as
 * ready-to-use data to `GalleryClient`: the latter must never call
 * `mediaUrl` itself, or it would fail once running in the browser
 * (see issue #68).
 */
export function PropertyGallery({
  photos,
  alt,
  dictionary,
}: {
  photos?: StrapiMedia[] | null;
  alt: string;
  dictionary: Dictionary;
}) {
  if (!photos || photos.length === 0) {
    return (
      <div
        className="aspect-video w-full bg-surface"
        role="img"
        aria-label={`Aucune photo disponible pour ${alt}`}
      />
    );
  }

  const { cover, tiles, hiddenCount } = buildGalleryPreview(photos);

  return (
    <GalleryClient
      cover={resolvePhoto(cover!, alt)}
      tiles={tiles.map((photo) => resolvePhoto(photo, alt))}
      allPhotos={photos.map((photo) => resolvePhoto(photo, alt))}
      hiddenCount={hiddenCount}
      dictionary={dictionary}
    />
  );
}
