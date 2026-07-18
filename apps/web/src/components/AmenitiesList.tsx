import type { PropertyAmenity } from "@/lib/strapi/types";

export function AmenitiesList({ amenities }: { amenities?: PropertyAmenity[] | null }) {
  if (!amenities || amenities.length === 0) return null;

  return (
    <ul className="grid list-none gap-x-16 gap-y-12 [grid-template-columns:repeat(auto-fit,minmax(120px,1fr))]">
      {amenities.map((amenity) => (
        <li
          key={amenity.id}
          className="flex items-baseline gap-4 text-sm text-foreground-muted before:font-bold before:text-gorse before:content-['✓']"
        >
          {amenity.label}
        </li>
      ))}
    </ul>
  );
}
