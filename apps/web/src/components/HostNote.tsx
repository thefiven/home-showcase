import type { BlocksContent } from "@strapi/blocks-react-renderer";
import type { Dictionary } from "@/i18n/dictionaries";
import type { PropertyAmenity } from "@/lib/strapi/types";
import { PropertyDescription } from "./PropertyDescription";
import { AmenitiesList } from "./AmenitiesList";
import styles from "./HostNote.module.css";

interface HostNoteProps {
  description?: BlocksContent | null;
  amenities?: PropertyAmenity[] | null;
  dictionary: Dictionary;
}

export function HostNote({ description, amenities, dictionary }: HostNoteProps) {
  const hasDescription = Boolean(description && description.length > 0);
  const hasAmenities = Boolean(amenities && amenities.length > 0);
  if (!hasDescription && !hasAmenities) return null;

  return (
    <section className={styles.hostNote}>
      {hasDescription && (
        <div>
          <p className={styles.eyebrow}>{dictionary.hostNote.eyebrow}</p>
          <PropertyDescription content={description} />
        </div>
      )}
      {hasAmenities && (
        <div>
          <p className={styles.eyebrow}>{dictionary.hostNote.amenitiesEyebrow}</p>
          <AmenitiesList amenities={amenities} />
        </div>
      )}
    </section>
  );
}
