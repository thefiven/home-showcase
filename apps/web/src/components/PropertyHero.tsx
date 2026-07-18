import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import { mediaUrl } from "@/lib/strapi/client";
import type { Property } from "@/lib/strapi/types";
import styles from "./PropertyHero.module.css";

export function PropertyHero({
  property,
  dictionary,
}: {
  property: Property;
  dictionary: Dictionary;
}) {
  const cover = property.photos?.[0];
  const eyebrow = [property.location?.city, property.location?.country].filter(Boolean).join(" · ");

  return (
    <section className={styles.hero}>
      {cover ? (
        <Image
          src={mediaUrl(cover.url)!}
          alt={cover.alternativeText || dictionary.hero.noPhotoAlt.replace("{name}", property.name)}
          fill
          sizes="100vw"
          priority
          className={styles.image}
        />
      ) : null}
      <div className={styles.overlay} />
      <div className={styles.content}>
        {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
        <h1 className={styles.title}>{property.name}</h1>
        {property.shortDescription && (
          <p className={styles.subtitle}>{property.shortDescription}</p>
        )}
        <div className={styles.actions}>
          <a href="#reservation" className={styles.ctaPrimary}>
            {dictionary.hero.ctaAvailability}
          </a>
          <a href="#galerie" className={styles.ctaSecondary}>
            {dictionary.hero.ctaGallery}
          </a>
        </div>
      </div>
    </section>
  );
}
