// Types mirroring the Strapi schemas (apps/cms/src/api, apps/cms/src/components).
// Strapi v5: "flattened" responses (no `attributes` wrapper like in v4).

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

/**
 * `shared.location` component. addressLine/postalCode/latitude/longitude
 * are `private` in Strapi (issue #56): never present in API responses.
 * approxLatitude/approxLongitude (~1km precision) are the only public
 * source of position, derived on the CMS side (Property lifecycle).
 */
export interface PropertyLocation {
  city: string;
  country: string;
  approxLatitude?: number | null;
  approxLongitude?: number | null;
  proximityNote?: string | null;
}

/** `property.pricing` component. */
export interface PropertyPricing {
  basePricePerNight: number;
  cleaningFee?: number | null;
  currency: "EUR" | "USD" | "GBP";
}

/** `shared.amenity` component. */
export interface PropertyAmenity {
  id: number;
  label: string;
  icon?: string | null;
}

/**
 * `Property` content-type (apps/cms/src/api/property).
 * `icalUrl` is `private` in Strapi: never present in API responses.
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
  maxGuests?: number | null;
  locale?: string;
}

/**
 * `Availability` content-type (apps/cms/src/api/availability), populated
 * by the iCal sync (`source: "airbnb"`) or entered manually. Not
 * localized in Strapi: dates don't depend on the language.
 */
export interface Availability {
  id: number;
  documentId: string;
  startDate: string;
  endDate: string;
  source: "airbnb" | "manual";
  externalUid?: string | null;
  summary?: string | null;
}

/**
 * Body sent to `POST /api/booking-requests` (issue #9). `property` is
 * the property's `documentId`. No `bookingStatus`: always forced to
 * `pending` server-side by Strapi (the controller ignores it if provided).
 */
export interface BookingRequestPayload {
  property: string;
  startDate: string;
  endDate: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  numberOfGuests?: number;
  message?: string;
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
