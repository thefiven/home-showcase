import type { PropertyAmenity } from "@/lib/strapi/types";
import styles from "./AmenitiesList.module.css";

export function AmenitiesList({ amenities }: { amenities?: PropertyAmenity[] | null }) {
  if (!amenities || amenities.length === 0) return null;

  return (
    <ul className={styles.list}>
      {amenities.map((amenity) => (
        <li key={amenity.id} className={styles.item}>
          {amenity.label}
        </li>
      ))}
    </ul>
  );
}
