import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import { mediaUrl } from "@/lib/strapi/client";
import type { PropertyLocation, StrapiMedia } from "@/lib/strapi/types";
import styles from "./LocationSection.module.css";

interface LocationSectionProps {
  location?: PropertyLocation | null;
  photos?: StrapiMedia[] | null;
  propertyName: string;
  dictionary: Dictionary;
}

export function LocationSection({
  location,
  photos,
  propertyName,
  dictionary,
}: LocationSectionProps) {
  if (!location) return null;

  const photo = photos?.[1] ?? photos?.[0];

  return (
    <section className={styles.location}>
      <div className={styles.text}>
        <p className={styles.eyebrow}>{dictionary.location.eyebrow}</p>
        <h2 className={styles.title}>{location.city}</h2>
        <p>{location.country}</p>
        {location.proximityNote && <p>{location.proximityNote}</p>}
        <p className={styles.hidden}>{dictionary.location.addressHidden}</p>
      </div>
      <div className={styles.photo}>
        {photo ? (
          <Image
            src={mediaUrl(photo.url)!}
            alt={photo.alternativeText || propertyName}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
          />
        ) : null}
      </div>
    </section>
  );
}
