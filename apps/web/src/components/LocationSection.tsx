import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import { approximateLocation } from "@/lib/location";
import { mediaUrl } from "@/lib/strapi/client";
import type { PropertyLocation, StrapiMedia } from "@/lib/strapi/types";
import { LocationMap } from "./LocationMap";

interface LocationSectionProps {
  location?: PropertyLocation | null;
  photos?: StrapiMedia[] | null;
  propertyName: string;
  dictionary: Dictionary;
}

const TEXT_MUTED = "text-[color-mix(in_srgb,var(--color-foreground-on-dark)_85%,transparent)]";

export function LocationSection({
  location,
  photos,
  propertyName,
  dictionary,
}: LocationSectionProps) {
  if (!location) return null;

  const photo = photos?.[1] ?? photos?.[0];
  const approximate =
    location.latitude != null && location.longitude != null
      ? approximateLocation(location.latitude, location.longitude)
      : null;

  return (
    <section className="grid items-center gap-[var(--gap-cols)] bg-surface-dark px-[var(--pad-nav-x)] py-[var(--pad-section)] text-foreground-on-dark [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
      <div className="max-w-[58ch]">
        <p className={`mb-8 font-mono text-xs tracking-[0.12em] uppercase ${TEXT_MUTED}`}>
          {dictionary.location.eyebrow}
        </p>
        <h2 className="mb-8 text-foreground-on-dark">{location.city}</h2>
        <p className={TEXT_MUTED}>{location.country}</p>
        {location.proximityNote && <p className={TEXT_MUTED}>{location.proximityNote}</p>}
        <p className={`mt-8 text-sm ${TEXT_MUTED}`}>{dictionary.location.addressHidden}</p>
      </div>
      <div className="relative aspect-[4/3] bg-[color-mix(in_srgb,var(--color-foreground-on-dark)_12%,transparent)]">
        {approximate ? (
          <LocationMap
            latitude={approximate.latitude}
            longitude={approximate.longitude}
            radiusMeters={approximate.radiusMeters}
            label={`${dictionary.location.eyebrow} — ${location.city}`}
          />
        ) : photo ? (
          <Image
            src={mediaUrl(photo.url)!}
            alt={photo.alternativeText || propertyName}
            fill
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-cover"
          />
        ) : null}
      </div>
    </section>
  );
}
