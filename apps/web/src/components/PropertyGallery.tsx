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
 * Résout les URLs de médias côté serveur (`mediaUrl` dépend de
 * `STRAPI_INTERNAL_URL`, une variable serveur uniquement) avant de les
 * transmettre en données déjà prêtes à `GalleryClient` : ce dernier ne doit
 * jamais rappeler `mediaUrl` lui-même, sous peine d'échouer une fois exécuté
 * dans le navigateur (cf. issue #68).
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
