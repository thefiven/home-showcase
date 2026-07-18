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
 * Dérive approxLatitude/approxLongitude (~1km de précision) depuis les
 * coordonnées exactes, pour que la position exacte (issue #56) ne transite
 * jamais par l'API publique jusqu'à la carte — approxLatitude/Longitude sont
 * la seule source de vérité publique, toujours recalculées et jamais
 * acceptées telles quelles depuis la saisie admin.
 */
export function deriveApproximateLocation(data: PropertyData): void {
  const location = data.location;
  if (!location) return;
  if (location.latitude == null || location.longitude == null) return;

  location.approxLatitude = roundTo(location.latitude, APPROXIMATION_PRECISION);
  location.approxLongitude = roundTo(location.longitude, APPROXIMATION_PRECISION);
}

/**
 * Les lifecycles de content-type (beforeCreate/beforeUpdate) ne reçoivent
 * pas la donnée du composant `location` sous une forme exploitable quand
 * l'écriture passe par entityService/Document Service (cf. issue #63) — la
 * dérivation doit donc vivre au niveau du Document Service middleware, seule
 * couche où `params.data.location` est bien l'objet composant soumis.
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
