// Types calqués sur les schémas Strapi (apps/cms/src/api, apps/cms/src/components).
// Strapi v5 : réponses "flatten" (pas de wrapper `attributes` comme en v4).

import type { BlocksContent } from "@strapi/blocks-react-renderer";

export interface StrapiMediaFormat {
  url: string;
  width?: number;
  height?: number;
}

export interface StrapiMedia {
  id: number;
  documentId: string;
  url: string;
  alternativeText?: string | null;
  width?: number;
  height?: number;
  formats?: Record<string, StrapiMediaFormat> | null;
}

/** Composant `shared.location`. */
export interface PropertyLocation {
  addressLine?: string | null;
  city: string;
  postalCode?: string | null;
  country: string;
  latitude?: number | null;
  longitude?: number | null;
}

/** Composant `property.pricing`. */
export interface PropertyPricing {
  basePricePerNight: number;
  cleaningFee?: number | null;
  currency: "EUR" | "USD" | "GBP";
}

/** Composant `shared.amenity`. */
export interface PropertyAmenity {
  id: number;
  label: string;
  icon?: string | null;
}

/**
 * Content-type `Property` (apps/cms/src/api/property).
 * `icalUrl` est `private` côté Strapi : jamais présent dans les réponses API.
 */
export interface Property {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: BlocksContent | null;
  shortDescription?: string | null;
  photos?: StrapiMedia[] | null;
  location?: PropertyLocation | null;
  pricing?: PropertyPricing | null;
  amenities?: PropertyAmenity[] | null;
  locale?: string;
}

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiCollectionResponse<T> {
  data: T[];
  meta: { pagination: StrapiPagination };
}

export interface StrapiSingleResponse<T> {
  data: T | null;
  meta: Record<string, unknown>;
}
