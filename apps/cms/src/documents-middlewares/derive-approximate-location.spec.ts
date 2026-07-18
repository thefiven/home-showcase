import { describe, expect, it, vi } from "vitest";
import {
  deriveApproximateLocation,
  deriveApproximateLocationMiddleware,
} from "./derive-approximate-location";

function buildContext(uid: string, action: string, params: Record<string, unknown>) {
  return { uid, action, params, contentType: {} } as never;
}

describe("deriveApproximateLocation", () => {
  it("dérive approxLatitude/approxLongitude à ~1km de précision depuis les coordonnées exactes", () => {
    const data = { location: { latitude: 48.856614, longitude: 2.352222 } };

    deriveApproximateLocation(data);

    expect(data.location.approxLatitude).toBe(48.86);
    expect(data.location.approxLongitude).toBe(2.35);
  });

  it("ne fait rien si aucune donnée location n'est présente", () => {
    const data = {};

    expect(() => deriveApproximateLocation(data)).not.toThrow();
    expect(data).not.toHaveProperty("location");
  });

  it("ne fait rien si latitude ou longitude sont manquantes (ne dérive pas de valeur partielle)", () => {
    const data = { location: { latitude: 48.86 } };

    deriveApproximateLocation(data);

    expect(data.location).not.toHaveProperty("approxLatitude");
    expect(data.location).not.toHaveProperty("approxLongitude");
  });

  it("écrase toute saisie manuelle des champs approx (source de vérité = coordonnées exactes)", () => {
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
  it("dérive approx* lors d'un create api::property.property et appelle next()", async () => {
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

  it("recalcule approx* lors d'un update", async () => {
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

  it("ne dérive pas de valeur partielle si latitude/longitude manquent, mais appelle next()", async () => {
    const context = buildContext("api::property.property", "create", {
      data: { location: { latitude: 48.86 } },
    });
    const next = vi.fn().mockResolvedValue(undefined);

    await deriveApproximateLocationMiddleware(context, next);

    expect(context.params.data.location).not.toHaveProperty("approxLatitude");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("ne touche pas aux données et appelle next() si data.location est absent", async () => {
    const context = buildContext("api::property.property", "create", { data: {} });
    const next = vi.fn().mockResolvedValue(undefined);

    await deriveApproximateLocationMiddleware(context, next);

    expect(context.params.data).not.toHaveProperty("location");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("ignore les content-types autres que api::property.property", async () => {
    const context = buildContext("api::availability.availability", "create", {
      data: { location: { latitude: 48.856614, longitude: 2.352222 } },
    });
    const next = vi.fn().mockResolvedValue(undefined);

    await deriveApproximateLocationMiddleware(context, next);

    expect(context.params.data.location).not.toHaveProperty("approxLatitude");
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("ignore les actions autres que create/update (ex. findMany)", async () => {
    const context = buildContext("api::property.property", "findMany", {
      filters: { slug: "test" },
    });
    const next = vi.fn().mockResolvedValue([]);

    await deriveApproximateLocationMiddleware(context, next);

    expect(context.params).not.toHaveProperty("data");
    expect(next).toHaveBeenCalledTimes(1);
  });
});
