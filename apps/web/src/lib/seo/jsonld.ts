import { resolvePublicBaseUrl } from "@/lib/strapi/client";
import type { Property } from "@/lib/strapi/types";

/**
 * Absolute URL for a Strapi media asset for external consumption
 * (JSON-LD, read by crawlers): unlike `mediaUrl` (used for `next/image`),
 * we prefix with the public URL, not the internal Docker URL — a crawler
 * cannot resolve `http://cms:1337`.
 */
function publicMediaUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${resolvePublicBaseUrl()}${path}`;
}

/**
 * Builds the `schema.org/LodgingBusiness` JSON-LD for a property's detail
 * page (#84), from data already loaded server-side (no extra fetch).
 * `geo` is omitted when the approximate position isn't set in Strapi,
 * rather than emitting coordinates at 0.
 */
export function buildLodgingJsonLd(property: Property, url: string): Record<string, unknown> {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: property.name,
    url,
  };

  if (property.shortDescription) {
    jsonLd.description = property.shortDescription;
  }

  if (property.photos && property.photos.length > 0) {
    jsonLd.image = property.photos.map((photo) => publicMediaUrl(photo.url));
  }

  if (property.maxGuests) {
    jsonLd.occupancy = {
      "@type": "QuantitativeValue",
      maxValue: property.maxGuests,
    };
  }

  if (property.location) {
    jsonLd.address = {
      "@type": "PostalAddress",
      addressLocality: property.location.city,
      addressCountry: property.location.country,
    };

    if (property.location.approxLatitude != null && property.location.approxLongitude != null) {
      jsonLd.geo = {
        "@type": "GeoCoordinates",
        latitude: property.location.approxLatitude,
        longitude: property.location.approxLongitude,
      };
    }
  }

  if (property.pricing) {
    const { basePricePerNight, currency } = property.pricing;
    jsonLd.priceRange = `${basePricePerNight} ${currency}`;
    jsonLd.makesOffer = {
      "@type": "Offer",
      price: basePricePerNight,
      priceCurrency: currency,
    };
  }

  return jsonLd;
}
