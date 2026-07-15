import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/strapi/client";
import type { Property } from "@/lib/strapi/types";
import type { Locale } from "@/i18n/config";
import { PricingSummary } from "./PricingSummary";
import styles from "./PropertyCard.module.css";

export function PropertyCard({ property, locale }: { property: Property; locale: Locale }) {
  const cover = property.photos?.[0];

  return (
    <Link href={`/${locale}/properties/${property.slug}`} className={styles.card}>
      <div className={styles.imageWrapper}>
        {cover ? (
          <Image
            src={mediaUrl(cover.url)!}
            alt={cover.alternativeText || property.name}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
          />
        ) : (
          <div className={styles.placeholder} />
        )}
      </div>
      <div className={styles.body}>
        <h2 className={styles.name}>{property.name}</h2>
        {property.location?.city && <p className={styles.city}>{property.location.city}</p>}
        {property.shortDescription && <p className={styles.excerpt}>{property.shortDescription}</p>}
        <PricingSummary pricing={property.pricing} />
      </div>
    </Link>
  );
}
