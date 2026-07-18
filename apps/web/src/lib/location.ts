/**
 * Coordonnées exactes du logement -> zone approximative pour affichage public.
 *
 * Arrondir à 2 décimales ramène la précision à ~1 km (jamais la position
 * exacte), conformément à la confidentialité de l'adresse actée en #51.
 */
const APPROXIMATION_PRECISION = 2;
export const APPROXIMATE_RADIUS_METERS = 900;

export interface ApproximateLocation {
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

function roundTo(value: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function approximateLocation(latitude: number, longitude: number): ApproximateLocation {
  return {
    latitude: roundTo(latitude, APPROXIMATION_PRECISION),
    longitude: roundTo(longitude, APPROXIMATION_PRECISION),
    radiusMeters: APPROXIMATE_RADIUS_METERS,
  };
}

const EARTH_CIRCUMFERENCE_METERS = 40075017;

/** Convertit un rayon en mètres en rayon en pixels pour un cercle MapLibre à une latitude/zoom donnés. */
export function metersToPixelsAtZoom(radiusMeters: number, latitude: number, zoom: number): number {
  const metersPerPixel =
    (EARTH_CIRCUMFERENCE_METERS * Math.cos((latitude * Math.PI) / 180)) / 2 ** (zoom + 8);
  return radiusMeters / metersPerPixel;
}
