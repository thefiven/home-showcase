import Image from "next/image";
import Link from "next/link";
import { mediaUrl } from "@/lib/strapi/client";
import type { Property } from "@/lib/strapi/types";
import type { Locale } from "@/i18n/config";
import { PricingSummary } from "./PricingSummary";

export function PropertyCard({ property, locale }: { property: Property; locale: Locale }) {
  const cover = property.photos?.[0];

  return (
    <Link
      href={`/${locale}/properties/${property.slug}`}
      className="flex flex-col overflow-hidden rounded-flat border border-border transition-colors duration-150 ease-in-out hover:border-border-strong"
    >
      <div className="relative aspect-[4/3] w-full bg-surface">
        {cover ? (
          <Image
            src={mediaUrl(cover.url)!}
            alt={cover.alternativeText || property.name}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-surface" />
        )}
      </div>
      <div className="flex flex-col gap-2 p-8">
        <h2 className="font-display text-[18px]">{property.name}</h2>
        {property.location?.city && (
          <p className="font-mono text-[13px] text-foreground-soft">{property.location.city}</p>
        )}
        {property.shortDescription && (
          <p className="text-[15px] text-foreground-muted">{property.shortDescription}</p>
        )}
        <PricingSummary pricing={property.pricing} />
      </div>
    </Link>
  );
}
