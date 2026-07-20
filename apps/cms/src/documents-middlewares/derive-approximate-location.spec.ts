import { describe, expect, it, vi } from "vitest";
import {
  deriveApproximateLocation,
  deriveApproximateLocationMiddleware,
} from "./derive-approximate-location";

function buildContext(uid: string, action: string, params: Record<string, unknown>) {
  return { uid, action, params, contentType: {} } as never;
}

describe("deriveApproximateLocation", () => {
  it("derives approxLatitude/approxLongitude at ~1km precision from the exact coordinates", () => {
    const data = { location: { latitude: 48.856614, longitude: 2.352222 } };

    deriveApproximateLocation(data);

    expect(data.location.approxLatitude).toBe(48.86);
    expect(data.location.approxLongitude).toBe(2.35);
  });

  it("does nothing if no location data is present", () => {
    const data = {};

    expect(() => deriveApproximateLocation(data)).not.toThrow();
    expect(data).not.toHaveProperty("location");
  });

  it("does nothing if latitude or longitude is missing (does not derive a partial value)", () => {
    const data = { location: { latitude: 48.86 } };

    deriveApproximateLocation(data);

    expect(data.location).not.toHaveProperty("approxLatitude");
    expect(data.location).not.toHaveProperty("approxLongitude");
  });

  it("overwrites any manually entered approx fields (source of truth = exact coordinates)", () => {
    const data = {
      location: {
        latitude: 45.764043,
        longitude: 4.835659,
        approxLatitude: 999,
        approxLongitude: 999,
      },
    };

    deriveApproximateLocation(data);

    expect(data.location.approxLatitude).toBe(45.76);
    expect(data.location.approxLongitude).toBe(4.84);
  });
});

describe("deriveApproximateLocationMiddleware", () => {
  it("derives approx* during an api::property.property create and calls next()", async () => {
    const context = buildContext("api::property.property", "create", {
      data: { location: { latitude: 48.856614, longitude: 2.352222 } },
    });
    const next = vi.fn().mockResolvedValue("result");

    const result = await deriveApproximateLocationMiddleware(context, next);

    expect(context.params.data.location.approxLatitude).toBe(48.86);
    expect(context.params.data.location.approxLongitude).toBe(2.35);
    expect(next).toHaveBeenCalledTimes(1);
    expect(result).toBe("result");
  });

  it("recomputes approx* during an update", async () => {
    const context = buildContext("api::property.property", "update", {
      documentId: "abc",
      data: { location: { latitude: 45.764043, longitude: 4.835659 } },
    });
    const next = vi.fn().mockResolvedValue(undefined);

    await deriveApproximateLocationMiddleware(context, next);

    expect(context.params.data.location.approxLatitude).toBe(45.76);
    expect(context.params.data.location.approxLongitude).toBe(4.84);
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("does not derive a partial value if latitude/longitude are missing, but calls next()", async () => {
    const context = buildContext("api::property.property", "create", {
      data: { location: { latitude: 48.86 } },
    });
    const next = vi.fn().mockResolvedValue(undefined);

    await deriveApproximateLocationMiddleware(context, next);

    expect(context.params.data.location).not.toHaveProperty("approxLatitude");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("does not touch the data and calls next() if data.location is absent", async () => {
    const context = buildContext("api::property.property", "create", { data: {} });
    const next = vi.fn().mockResolvedValue(undefined);

    await deriveApproximateLocationMiddleware(context, next);

    expect(context.params.data).not.toHaveProperty("location");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("ignores content types other than api::property.property", async () => {
    const context = buildContext("api::availability.availability", "create", {
      data: { location: { latitude: 48.856614, longitude: 2.352222 } },
    });
    const next = vi.fn().mockResolvedValue(undefined);

    await deriveApproximateLocationMiddleware(context, next);

    expect(context.params.data.location).not.toHaveProperty("approxLatitude");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("ignores actions other than create/update (e.g. findMany)", async () => {
    const context = buildContext("api::property.property", "findMany", {
      filters: { slug: "test" },
    });
    const next = vi.fn().mockResolvedValue([]);

    await deriveApproximateLocationMiddleware(context, next);

    expect(context.params).not.toHaveProperty("data");
    expect(next).toHaveBeenCalledTimes(1);
  });
});
