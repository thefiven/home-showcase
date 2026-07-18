import type { BlocksContent } from "@strapi/blocks-react-renderer";
import type { Dictionary } from "@/i18n/dictionaries";
import type { PropertyAmenity } from "@/lib/strapi/types";
import { PropertyDescription } from "./PropertyDescription";
import { AmenitiesList } from "./AmenitiesList";

interface HostNoteProps {
  description?: BlocksContent | null;
  amenities?: PropertyAmenity[] | null;
  dictionary: Dictionary;
}

const EYEBROW = "mb-8 font-mono text-xs uppercase tracking-[0.12em] text-foreground-soft";

export function HostNote({ description, amenities, dictionary }: HostNoteProps) {
  const hasDescription = Boolean(description && description.length > 0);
  const hasAmenities = Boolean(amenities && amenities.length > 0);
  if (!hasDescription && !hasAmenities) return null;

  return (
    <section className="grid gap-[var(--gap-cols)] [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
      {hasDescription && (
        <div>
          <p className={EYEBROW}>{dictionary.hostNote.eyebrow}</p>
          <PropertyDescription content={description} />
        </div>
      )}
      {hasAmenities && (
        <div>
          <p className={EYEBROW}>{dictionary.hostNote.amenitiesEyebrow}</p>
          <AmenitiesList amenities={amenities} />
        </div>
      )}
    </section>
  );
}
