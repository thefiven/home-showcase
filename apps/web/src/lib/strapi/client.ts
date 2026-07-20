import { defaultLocale } from "@/i18n/config";
import type {
  Availability,
  BookingRequestPayload,
  Property,
  StrapiCollectionResponse,
} from "./types";

/** Fallback locale used when a requested translation does not yet exist in Strapi. */
export const DEFAULT_LOCALE = defaultLocale;

/** ISR revalidation duration (seconds): SSG refreshed periodically. */
export const REVALIDATE_SECONDS = 60;

interface StrapiEnv {
  NEXT_PUBLIC_STRAPI_URL?: string;
  STRAPI_INTERNAL_URL?: string;
}

function currentEnv(): StrapiEnv {
  return process.env as StrapiEnv;
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

/**
 * Base URL used for server-side calls (SSR/ISR): prioritizes
 * `STRAPI_INTERNAL_URL` (resolved by the `web` container on the Docker
 * network, e.g. `http://cms:1337`), falling back to `NEXT_PUBLIC_STRAPI_URL`.
 */
export function resolveServerBaseUrl(env: StrapiEnv = currentEnv()): string {
  const url = env.STRAPI_INTERNAL_URL || env.NEXT_PUBLIC_STRAPI_URL;
  if (!url) {
    throw new Error("STRAPI_INTERNAL_URL or NEXT_PUBLIC_STRAPI_URL must be set to reach Strapi.");
  }
  return stripTrailingSlash(url);
}

/**
 * Base URL resolvable by the browser, used to prefix media paths
 * returned by Strapi (relative to its own host).
 */
export function resolvePublicBaseUrl(env: StrapiEnv = currentEnv()): string {
  const url = env.NEXT_PUBLIC_STRAPI_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_STRAPI_URL must be set to build media URLs.");
  }
  return stripTrailingSlash(url);
}

/**
 * Prefixes a (relative) Strapi media URL for use as the `src` of
 * `next/image`. Uses the server URL (`resolveServerBaseUrl`), not the
 * public one: even for a page rendered server-side, it's Next's image
 * optimizer that fetches the source file, and it runs in the server
 * process (the `web` container in Docker) — a URL only resolvable by the
 * browser (`localhost:1337`) fails there (`fetch failed`, since `cms` is
 * not `localhost` as seen from this container). Idempotent on URLs that
 * are already absolute.
 */
export function mediaUrl(
  path: string | undefined | null,
  env: StrapiEnv = currentEnv(),
): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${resolveServerBaseUrl(env)}${path}`;
}

/** `GET /api/properties` — list, populating relations/components needed for display. */
export function buildPropertiesListUrl(
  locale: string = DEFAULT_LOCALE,
  env: StrapiEnv = currentEnv(),
): string {
  const params = new URLSearchParams();
  params.set("locale", locale);
  params.set("populate[photos]", "true");
  params.set("populate[location]", "true");
  params.set("populate[pricing]", "true");
  params.set("populate[amenities]", "true");
  return `${resolveServerBaseUrl(env)}/api/properties?${params.toString()}`;
}

/** `GET /api/properties?filters[slug][$eq]=...` — detail by slug (not localized, shared across languages). */
export function buildPropertyBySlugUrl(
  slug: string,
  locale: string = DEFAULT_LOCALE,
  env: StrapiEnv = currentEnv(),
): string {
  const params = new URLSearchParams();
  params.set("filters[slug][$eq]", slug);
  params.set("locale", locale);
  params.set("populate", "*");
  return `${resolveServerBaseUrl(env)}/api/properties?${params.toString()}`;
}

/** Minimal URL (slug only) for `generateStaticParams`. */
export function buildSlugsUrl(env: StrapiEnv = currentEnv()): string {
  const params = new URLSearchParams();
  params.set("fields[0]", "slug");
  params.set("locale", DEFAULT_LOCALE);
  params.set("pagination[pageSize]", "100");
  return `${resolveServerBaseUrl(env)}/api/properties?${params.toString()}`;
}

/**
 * `GET /api/availabilities?filters[property][documentId][$eq]=...` —
 * blocked date ranges for a property, sorted chronologically. Filters on
 * `documentId` (stable, not localized) rather than `id` (specific to each
 * language variant in Strapi v5).
 */
export function buildAvailabilitiesForPropertyUrl(
  propertyDocumentId: string,
  env: StrapiEnv = currentEnv(),
): string {
  const params = new URLSearchParams();
  params.set("filters[property][documentId][$eq]", propertyDocumentId);
  params.set("sort", "startDate:asc");
  params.set("pagination[pageSize]", "100");
  return `${resolveServerBaseUrl(env)}/api/availabilities?${params.toString()}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
  if (!response.ok) {
    throw new Error(`Strapi request failed (${response.status}): ${url}`);
  }
  return (await response.json()) as T;
}

/**
 * Published properties for the list page. If `locale` has no translated
 * entry, falls back to `DEFAULT_LOCALE` rather than showing an empty list
 * (SPEC.md §2: translation fallback). Returns `[]` if Strapi is unreachable.
 */
export async function getProperties(locale: string = DEFAULT_LOCALE): Promise<Property[]> {
  try {
    const json = await fetchJson<StrapiCollectionResponse<Property>>(
      buildPropertiesListUrl(locale),
    );
    if (json.data.length > 0 || locale === DEFAULT_LOCALE) {
      return json.data;
    }
    const fallback = await fetchJson<StrapiCollectionResponse<Property>>(
      buildPropertiesListUrl(DEFAULT_LOCALE),
    );
    return fallback.data;
  } catch (error) {
    console.error("[strapi] getProperties failed:", error);
    return [];
  }
}

/**
 * Property by slug for the detail page. If no translation exists for
 * `locale`, falls back to `DEFAULT_LOCALE` (translation fallback, SPEC.md §2).
 * Returns `null` if absent even with fallback, or if Strapi is unreachable.
 */
export async function getPropertyBySlug(
  slug: string,
  locale: string = DEFAULT_LOCALE,
): Promise<Property | null> {
  try {
    const json = await fetchJson<StrapiCollectionResponse<Property>>(
      buildPropertyBySlugUrl(slug, locale),
    );
    const property = json.data[0] ?? null;
    if (property || locale === DEFAULT_LOCALE) {
      return property;
    }
    const fallback = await fetchJson<StrapiCollectionResponse<Property>>(
      buildPropertyBySlugUrl(slug, DEFAULT_LOCALE),
    );
    return fallback.data[0] ?? null;
  } catch (error) {
    console.error(`[strapi] getPropertyBySlug("${slug}") failed:`, error);
    return null;
  }
}

/**
 * Blocked date ranges for a property's availability calendar. Live query
 * (no hardcoded data) revalidated every `REVALIDATE_SECONDS`, to reflect a
 * new iCal sync without redeploying. Returns `[]` if Strapi is unreachable.
 */
export async function getAvailabilitiesForProperty(
  propertyDocumentId: string,
): Promise<Availability[]> {
  try {
    const json = await fetchJson<StrapiCollectionResponse<Availability>>(
      buildAvailabilitiesForPropertyUrl(propertyDocumentId),
    );
    return json.data;
  } catch (error) {
    console.error(`[strapi] getAvailabilitiesForProperty("${propertyDocumentId}") failed:`, error);
    return [];
  }
}

/** `POST /api/booking-requests` — submits a booking request. */
export function buildBookingRequestCreateUrl(env: StrapiEnv = currentEnv()): string {
  return `${resolveServerBaseUrl(env)}/api/booking-requests`;
}

/**
 * Submits a booking request (unauthenticated visitor). Strapi forces
 * `bookingStatus: "pending"` server-side no matter what `payload` contains
 * (issue #9): this is never a way to self-accept a request. Throws an
 * error carrying the message returned by Strapi if the request is rejected
 * (e.g. unavailable dates), for display to the visitor.
 */
export async function createBookingRequest(
  payload: BookingRequestPayload,
  env: StrapiEnv = currentEnv(),
): Promise<void> {
  const response = await fetch(buildBookingRequestCreateUrl(env), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: payload }),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
    } | null;
    throw new Error(body?.error?.message || `Strapi request failed (${response.status})`);
  }
}

/** Published slugs, for `generateStaticParams`. Returns `[]` if Strapi is unreachable. */
export async function getAllSlugs(): Promise<string[]> {
  try {
    const json = await fetchJson<StrapiCollectionResponse<Pick<Property, "slug">>>(buildSlugsUrl());
    return json.data.map((property) => property.slug);
  } catch (error) {
    console.error("[strapi] getAllSlugs failed:", error);
    return [];
  }
}
