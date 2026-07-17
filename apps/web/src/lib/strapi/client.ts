import { defaultLocale } from "@/i18n/config";
import type {
  Availability,
  BookingRequestPayload,
  Property,
  StrapiCollectionResponse,
} from "./types";

/** Locale de repli utilisée quand une traduction demandée n'existe pas encore côté Strapi. */
export const DEFAULT_LOCALE = defaultLocale;

/** Durée de revalidation ISR (secondes) : SSG rafraîchi périodiquement. */
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
 * URL de base utilisée pour les appels serveur (SSR/ISR) : priorité à
 * `STRAPI_INTERNAL_URL` (résolue par le conteneur `web` sur le réseau Docker,
 * ex. `http://cms:1337`), avec repli sur `NEXT_PUBLIC_STRAPI_URL`.
 */
export function resolveServerBaseUrl(env: StrapiEnv = currentEnv()): string {
  const url = env.STRAPI_INTERNAL_URL || env.NEXT_PUBLIC_STRAPI_URL;
  if (!url) {
    throw new Error(
      "STRAPI_INTERNAL_URL ou NEXT_PUBLIC_STRAPI_URL doit être défini pour joindre Strapi.",
    );
  }
  return stripTrailingSlash(url);
}

/**
 * URL de base résolvable par le navigateur, utilisée pour préfixer les
 * chemins de médias renvoyés par Strapi (relatifs à son propre hôte).
 */
export function resolvePublicBaseUrl(env: StrapiEnv = currentEnv()): string {
  const url = env.NEXT_PUBLIC_STRAPI_URL;
  if (!url) {
    throw new Error("NEXT_PUBLIC_STRAPI_URL doit être défini pour construire les URLs de médias.");
  }
  return stripTrailingSlash(url);
}

/** Préfixe une URL de média Strapi (relative) avec l'URL publique. Idempotent sur les URLs déjà absolues. */
export function mediaUrl(
  path: string | undefined | null,
  env: StrapiEnv = currentEnv(),
): string | null {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${resolvePublicBaseUrl(env)}${path}`;
}

/** `GET /api/properties` — liste, avec populate des relations/composants nécessaires à l'affichage. */
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

/** `GET /api/properties?filters[slug][$eq]=...` — détail par slug (non localisé, partagé entre langues). */
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

/** URL minimale (slug seul) pour `generateStaticParams`. */
export function buildSlugsUrl(env: StrapiEnv = currentEnv()): string {
  const params = new URLSearchParams();
  params.set("fields[0]", "slug");
  params.set("locale", DEFAULT_LOCALE);
  params.set("pagination[pageSize]", "100");
  return `${resolveServerBaseUrl(env)}/api/properties?${params.toString()}`;
}

/**
 * `GET /api/availabilities?filters[property][documentId][$eq]=...` — plages
 * bloquées d'un logement, triées chronologiquement. Filtre sur `documentId`
 * (stable, non localisé) plutôt que sur `id` (propre à chaque variante de
 * langue en Strapi v5).
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
    throw new Error(`Requête Strapi échouée (${response.status}) : ${url}`);
  }
  return (await response.json()) as T;
}

/**
 * Logements publiés pour la page liste. Si `locale` n'a aucune entrée traduite,
 * replie sur `DEFAULT_LOCALE` plutôt que d'afficher une liste vide (SPEC.md §2 :
 * fallback de traduction). Retourne `[]` si Strapi est injoignable.
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
    console.error("[strapi] getProperties a échoué :", error);
    return [];
  }
}

/**
 * Logement par slug pour la page détail. Si aucune traduction n'existe pour
 * `locale`, replie sur `DEFAULT_LOCALE` (fallback de traduction, SPEC.md §2).
 * Retourne `null` si absent même en repli, ou si Strapi est injoignable.
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
    console.error(`[strapi] getPropertyBySlug("${slug}") a échoué :`, error);
    return null;
  }
}

/**
 * Plages bloquées d'un logement pour le calendrier de disponibilité. Requête
 * live (pas de données codées en dur) revalidée toutes les `REVALIDATE_SECONDS`,
 * pour refléter une nouvelle synchronisation iCal sans redéploiement.
 * Retourne `[]` si Strapi est injoignable.
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
    console.error(
      `[strapi] getAvailabilitiesForProperty("${propertyDocumentId}") a échoué :`,
      error,
    );
    return [];
  }
}

/** `POST /api/booking-requests` — soumission d'une demande de réservation. */
export function buildBookingRequestCreateUrl(env: StrapiEnv = currentEnv()): string {
  return `${resolveServerBaseUrl(env)}/api/booking-requests`;
}

/**
 * Soumet une demande de réservation (visiteur non authentifié). Strapi force
 * `bookingStatus: "pending"` côté serveur quoi que contienne `payload` (issue #9) :
 * ceci n'est jamais un moyen d'auto-accepter une demande. Lève une erreur
 * portant le message renvoyé par Strapi si la demande est rejetée (ex. dates
 * indisponibles), pour affichage au visiteur.
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
    throw new Error(body?.error?.message || `Requête Strapi échouée (${response.status})`);
  }
}

/** Slugs publiés, pour `generateStaticParams`. Retourne `[]` si Strapi est injoignable. */
export async function getAllSlugs(): Promise<string[]> {
  try {
    const json = await fetchJson<StrapiCollectionResponse<Pick<Property, "slug">>>(buildSlugsUrl());
    return json.data.map((property) => property.slug);
  } catch (error) {
    console.error("[strapi] getAllSlugs a échoué :", error);
    return [];
  }
}
