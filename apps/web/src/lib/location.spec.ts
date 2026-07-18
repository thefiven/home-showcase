import { describe, expect, it } from "vitest";
import { APPROXIMATE_RADIUS_METERS, approximateLocation, metersToPixelsAtZoom } from "./location";

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

describe("metersToPixelsAtZoom", () => {
  it("convertit un rayon en mètres à l'équateur (cos(0) = 1)", () => {
    const zoom = 11;
    const metersPerPixelAtEquator = 40075017 / 2 ** (zoom + 8);
    const expected = 900 / metersPerPixelAtEquator;

    expect(metersToPixelsAtZoom(900, 0, zoom)).toBeCloseTo(expected, 6);
  });

  it("augmente le rayon en pixels avec le zoom, à latitude fixée", () => {
    const atZoom11 = metersToPixelsAtZoom(900, 48.86, 11);
    const atZoom12 = metersToPixelsAtZoom(900, 48.86, 12);

    expect(atZoom12).toBeGreaterThan(atZoom11);
    expect(atZoom12).toBeCloseTo(atZoom11 * 2, 6);
  });

  it("augmente le rayon en pixels à mesure que la latitude s'éloigne de l'équateur (étirement Web Mercator, cos(lat) au dénominateur)", () => {
    const atEquator = metersToPixelsAtZoom(900, 0, 11);
    const atParis = metersToPixelsAtZoom(900, 48.86, 11);

    expect(atParis).toBeGreaterThan(atEquator);
  });
});
