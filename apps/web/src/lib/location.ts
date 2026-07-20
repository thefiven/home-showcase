/**
 * Property's exact coordinates -> approximate zone for public display.
 *
 * Rounding to 2 decimals brings the precision down to ~1 km (never the
 * exact position), in line with the address privacy decided in #51.
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

/** Converts a radius in meters to a radius in pixels for a MapLibre circle at a given latitude/zoom. */
export function metersToPixelsAtZoom(radiusMeters: number, latitude: number, zoom: number): number {
  const metersPerPixel =
    (EARTH_CIRCUMFERENCE_METERS * Math.cos((latitude * Math.PI) / 180)) / 2 ** (zoom + 8);
  return radiusMeters / metersPerPixel;
}
