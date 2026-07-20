import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { buildLodgingJsonLd } from "./jsonld";
import type { Property } from "@/lib/strapi/types";

const PROPERTY: Property = {
  id: 1,
  documentId: "abc123",
  name: "Loft du Vieux Port",
  slug: "loft-du-vieux-port",
  shortDescription: "Un loft lumineux au coeur du Vieux Port.",
  photos: [
    { id: 1, documentId: "photo1", url: "/uploads/photo1.jpg" },
    { id: 2, documentId: "photo2", url: "https://cdn.exemple.com/photo2.jpg" },
  ],
  location: {
    city: "Marseille",
    country: "France",
    approxLatitude: 43.29,
    approxLongitude: 5.37,
  },
  pricing: { basePricePerNight: 90, currency: "EUR" },
  maxGuests: 4,
};

const CANONICAL_URL = "https://exemple.com/fr/properties/loft-du-vieux-port";

describe("buildLodgingJsonLd", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_STRAPI_URL = "http://localhost:1337";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("builds a LodgingBusiness with all available fields", () => {
    const jsonLd = buildLodgingJsonLd(PROPERTY, CANONICAL_URL);

    expect(jsonLd).toMatchObject({
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      name: "Loft du Vieux Port",
      url: CANONICAL_URL,
      description: "Un loft lumineux au coeur du Vieux Port.",
      occupancy: { "@type": "QuantitativeValue", maxValue: 4 },
      address: {
        "@type": "PostalAddress",
        addressLocality: "Marseille",
        addressCountry: "France",
      },
      geo: { "@type": "GeoCoordinates", latitude: 43.29, longitude: 5.37 },
      priceRange: "90 EUR",
      makesOffer: { "@type": "Offer", price: 90, priceCurrency: "EUR" },
    });
  });

  it("prefixes relative images with the public Strapi URL (not the internal one) and leaves absolute URLs unchanged", () => {
    const jsonLd = buildLodgingJsonLd(PROPERTY, CANONICAL_URL);

    expect(jsonLd.image).toEqual([
      "http://localhost:1337/uploads/photo1.jpg",
      "https://cdn.exemple.com/photo2.jpg",
    ]);
  });

  it("omits geo when the approximate position is not set", () => {
    const property: Property = {
      ...PROPERTY,
      location: { city: "Marseille", country: "France" },
    };

    const jsonLd = buildLodgingJsonLd(property, CANONICAL_URL);

    expect(jsonLd.geo).toBeUndefined();
    expect(jsonLd.address).toEqual({
      "@type": "PostalAddress",
      addressLocality: "Marseille",
      addressCountry: "France",
    });
  });

  it("omits absent optional fields (photos, pricing, location, occupancy)", () => {
    const property: Property = {
      id: 1,
      documentId: "abc123",
      name: "Loft du Vieux Port",
      slug: "loft-du-vieux-port",
    };

    const jsonLd = buildLodgingJsonLd(property, CANONICAL_URL);

    expect(jsonLd).toEqual({
      "@context": "https://schema.org",
      "@type": "LodgingBusiness",
      name: "Loft du Vieux Port",
      url: CANONICAL_URL,
    });
  });
});
