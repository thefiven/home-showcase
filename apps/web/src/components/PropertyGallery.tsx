import Image from "next/image";
import { mediaUrl } from "@/lib/strapi/client";
import type { StrapiMedia } from "@/lib/strapi/types";
import styles from "./PropertyGallery.module.css";

export function PropertyGallery({ photos, alt }: { photos?: StrapiMedia[] | null; alt: string }) {
  if (!photos || photos.length === 0) {
    return (
      <div
        className={styles.placeholder}
        role="img"
        aria-label={`Aucune photo disponible pour ${alt}`}
      />
    );
  }

  const [cover, ...rest] = photos;

  return (
    <div className={styles.gallery}>
      <div className={styles.cover}>
        <Image
          src={mediaUrl(cover.url)!}
          alt={cover.alternativeText || alt}
          fill
          sizes="(max-width: 768px) 100vw, 800px"
          priority
        />
      </div>
      {rest.length > 0 && (
        <div className={styles.thumbnails}>
          {rest.map((photo) => (
            <div key={photo.id} className={styles.thumbnail}>
              <Image
                src={mediaUrl(photo.url)!}
                alt={photo.alternativeText || alt}
                fill
                sizes="200px"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
