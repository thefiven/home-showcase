import Image from "next/image";
import { mediaUrl } from "@/lib/strapi/client";
import type { StrapiMedia } from "@/lib/strapi/types";

export function PropertyGallery({ photos, alt }: { photos?: StrapiMedia[] | null; alt: string }) {
  if (!photos || photos.length === 0) {
    return (
      <div
        className="aspect-video w-full bg-surface"
        role="img"
        aria-label={`Aucune photo disponible pour ${alt}`}
      />
    );
  }

  const [cover, ...rest] = photos;

  return (
    <div className="flex flex-col gap-6">
      <div className="relative aspect-video w-full overflow-hidden bg-surface">
        <Image
          src={mediaUrl(cover.url)!}
          alt={cover.alternativeText || alt}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          priority
          className="object-cover"
        />
      </div>
      {rest.length > 0 && (
        <div className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(96px,1fr))]">
          {rest.map((photo) => (
            <div key={photo.id} className="relative aspect-square overflow-hidden bg-surface">
              <Image
                src={mediaUrl(photo.url)!}
                alt={photo.alternativeText || alt}
                fill
                sizes="200px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
