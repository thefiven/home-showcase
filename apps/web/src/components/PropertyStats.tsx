import type { Dictionary } from "@/i18n/dictionaries";
import { formatAmount } from "@/lib/pricing";
import type { PropertyLocation, PropertyPricing } from "@/lib/strapi/types";
import styles from "./PropertyStats.module.css";

interface PropertyStatsProps {
  pricing?: PropertyPricing | null;
  maxGuests?: number | null;
  location?: PropertyLocation | null;
  dictionary: Dictionary;
}

export function PropertyStats({ pricing, maxGuests, location, dictionary }: PropertyStatsProps) {
  const tiles = [
    pricing && {
      value: formatAmount(pricing.basePricePerNight, pricing.currency),
      label: dictionary.stats.perNight,
      accent: true,
    },
    maxGuests != null && {
      value: String(maxGuests),
      label: dictionary.stats.maxGuests,
      accent: false,
    },
    location?.proximityNote && { value: location.proximityNote, label: "", accent: false },
    pricing?.cleaningFee != null && {
      value: formatAmount(pricing.cleaningFee, pricing.currency),
      label: dictionary.stats.cleaningFee,
      accent: false,
    },
  ].filter((tile): tile is { value: string; label: string; accent: boolean } => Boolean(tile));

  if (tiles.length === 0) return null;

  return (
    <section className={styles.stats}>
      {tiles.map((tile, index) => (
        <div key={index} className={styles.tile}>
          <p className={tile.accent ? `${styles.value} ${styles.accent}` : styles.value}>
            {tile.value}
          </p>
          {tile.label && <p className={styles.label}>{tile.label}</p>}
        </div>
      ))}
    </section>
  );
}
