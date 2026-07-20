import type { Modules } from "@strapi/strapi";

interface LocationData {
  latitude?: number | null;
  longitude?: number | null;
  approxLatitude?: number | null;
  approxLongitude?: number | null;
}

interface PropertyData {
  location?: LocationData;
}

const APPROXIMATION_PRECISION = 2;
const PROPERTY_UID = "api::property.property";
const HANDLED_ACTIONS = new Set(["create", "update"]);

function roundTo(value: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

/**
 * Derives approxLatitude/approxLongitude (~1km precision) from the exact
 * coordinates, so that the exact position (issue #56) never travels
 * through the public API up to the map — approxLatitude/Longitude are
 * the only public source of truth, always recomputed and never accepted
 * as-is from admin input.
 */
export function deriveApproximateLocation(data: PropertyData): void {
  const location = data.location;
  if (!location) return;
  if (location.latitude == null || location.longitude == null) return;

  location.approxLatitude = roundTo(location.latitude, APPROXIMATION_PRECISION);
  location.approxLongitude = roundTo(location.longitude, APPROXIMATION_PRECISION);
}

/**
 * Content-type lifecycles (beforeCreate/beforeUpdate) don't receive the
 * `location` component data in a usable form when the write goes through
 * entityService/Document Service (see issue #63) — the derivation must
 * therefore live at the Document Service middleware level, the only
 * layer where `params.data.location` is reliably the submitted component
 * object.
 */
export const deriveApproximateLocationMiddleware: Modules.Documents.Middleware.Middleware = async (
  context,
  next,
) => {
  if (
    context.uid === PROPERTY_UID &&
    HANDLED_ACTIONS.has(context.action) &&
    "data" in context.params &&
    context.params.data
  ) {
    deriveApproximateLocation(context.params.data as PropertyData);
  }

  return next();
};
