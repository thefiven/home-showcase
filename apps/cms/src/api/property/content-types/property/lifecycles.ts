interface LocationData {
  latitude?: number | null;
  longitude?: number | null;
  approxLatitude?: number | null;
  approxLongitude?: number | null;
}

interface PropertyEvent {
  params: {
    data: {
      location?: LocationData;
    };
  };
}

const APPROXIMATION_PRECISION = 2;

function roundTo(value: number, precision: number): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

/**
 * Derives the public approxLatitude/approxLongitude (~1km precision) from the
 * private exact coordinates, so the exact position (issue #56) never has to
 * transit through the public API to reach the map — approxLatitude/Longitude
 * are the only public source of truth, always recomputed from latitude/
 * longitude and never trusted from admin input directly.
 */
export function deriveApproximateLocation(event: PropertyEvent): void {
  const location = event.params.data.location;
  if (!location) return;
  if (location.latitude == null || location.longitude == null) return;

  location.approxLatitude = roundTo(location.latitude, APPROXIMATION_PRECISION);
  location.approxLongitude = roundTo(location.longitude, APPROXIMATION_PRECISION);
}

export default {
  beforeCreate(event: PropertyEvent) {
    deriveApproximateLocation(event);
  },
  beforeUpdate(event: PropertyEvent) {
    deriveApproximateLocation(event);
  },
};
