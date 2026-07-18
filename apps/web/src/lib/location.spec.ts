import { describe, expect, it } from "vitest";
import { APPROXIMATE_RADIUS_METERS, approximateLocation } from "./location";

describe("approximateLocation", () => {
  it("arrondit les coordonnées à 2 décimales (~1 km de précision)", () => {
    const result = approximateLocation(48.856614, 2.352222);
    expect(result.latitude).toBe(48.86);
    expect(result.longitude).toBe(2.35);
  });

  it("ne renvoie jamais les coordonnées exactes en entrée", () => {
    const exactLat = 45.764043;
    const exactLng = 4.835659;
    const result = approximateLocation(exactLat, exactLng);
    expect(result.latitude).not.toBe(exactLat);
    expect(result.longitude).not.toBe(exactLng);
  });

  it("gère les coordonnées négatives et les valeurs limites", () => {
    expect(approximateLocation(-33.868199, -151.209).latitude).toBe(-33.87);
    expect(approximateLocation(0, 0)).toEqual({
      latitude: 0,
      longitude: 0,
      radiusMeters: APPROXIMATE_RADIUS_METERS,
    });
    expect(approximateLocation(89.999, 179.999)).toEqual({
      latitude: 90,
      longitude: 180,
      radiusMeters: APPROXIMATE_RADIUS_METERS,
    });
  });

  it("inclut un rayon d'approximation constant", () => {
    expect(approximateLocation(10.1234, 20.5678).radiusMeters).toBe(APPROXIMATE_RADIUS_METERS);
  });
});
