import type { PropertyAmenity } from "@/lib/strapi/types";
import { AmenityIcon } from "./AmenityIcon";

export function AmenitiesList({ amenities }: { amenities?: PropertyAmenity[] | null }) {
  if (!amenities || amenities.length === 0) return null;

  return (
    <ul className="grid list-none gap-x-16 gap-y-12 [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]">
      {amenities.map((amenity) => (
        <li key={amenity.id} className="flex items-center gap-8 text-sm text-foreground-muted">
          <AmenityIcon name={amenity.icon} />
          {amenity.label}
        </li>
      ))}
    </ul>
  );
}
