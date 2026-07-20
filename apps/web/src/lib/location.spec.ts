import { describe, expect, it } from "vitest";
import { APPROXIMATE_RADIUS_METERS, approximateLocation, metersToPixelsAtZoom } from "./location";

describe("approximateLocation", () => {
  it("rounds coordinates to 2 decimals (~1 km precision)", () => {
    const result = approximateLocation(48.856614, 2.352222);
    expect(result.latitude).toBe(48.86);
    expect(result.longitude).toBe(2.35);
  });

  it("never returns the exact input coordinates", () => {
    const exactLat = 45.764043;
    const exactLng = 4.835659;
    const result = approximateLocation(exactLat, exactLng);
    expect(result.latitude).not.toBe(exactLat);
    expect(result.longitude).not.toBe(exactLng);
  });

  it("handles negative coordinates and boundary values", () => {
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

  it("includes a constant approximation radius", () => {
    expect(approximateLocation(10.1234, 20.5678).radiusMeters).toBe(APPROXIMATE_RADIUS_METERS);
  });
});

describe("metersToPixelsAtZoom", () => {
  it("converts a radius in meters at the equator (cos(0) = 1)", () => {
    const zoom = 11;
    const metersPerPixelAtEquator = 40075017 / 2 ** (zoom + 8);
    const expected = 900 / metersPerPixelAtEquator;

    expect(metersToPixelsAtZoom(900, 0, zoom)).toBeCloseTo(expected, 6);
  });

  it("increases the radius in pixels with zoom, at a fixed latitude", () => {
    const atZoom11 = metersToPixelsAtZoom(900, 48.86, 11);
    const atZoom12 = metersToPixelsAtZoom(900, 48.86, 12);

    expect(atZoom12).toBeGreaterThan(atZoom11);
    expect(atZoom12).toBeCloseTo(atZoom11 * 2, 6);
  });

  it("increases the radius in pixels as latitude moves away from the equator (Web Mercator stretch, cos(lat) in the denominator)", () => {
    const atEquator = metersToPixelsAtZoom(900, 0, 11);
    const atParis = metersToPixelsAtZoom(900, 48.86, 11);

    expect(atParis).toBeGreaterThan(atEquator);
  });
});
