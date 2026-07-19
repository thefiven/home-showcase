import { resolvePublicBaseUrl } from "@/lib/strapi/client";
import type { Property } from "@/lib/strapi/types";

/**
 * URL absolue d'un média Strapi pour consommation externe (JSON-LD, lu par
 * les crawlers) : contrairement à `mediaUrl` (utilisé pour `next/image`), on
 * préfixe avec l'URL publique, pas l'URL interne Docker — un crawler ne peut
 * pas résoudre `http://cms:1337`.
 */
function publicMediaUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return `${resolvePublicBaseUrl()}${path}`;
}

/**
 * Construit le JSON-LD `schema.org/LodgingBusiness` d'un logement pour la
 * page détail (#84), à partir des données déjà chargées côté serveur (aucun
 * fetch supplémentaire). `geo` est omis quand la position approximative
 * n'est pas renseignée côté Strapi plutôt que d'émettre des coordonnées à 0.
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
