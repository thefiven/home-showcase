import { describe, expect, it } from "vitest";
import { deriveApproximateLocation } from "./lifecycles";

describe("deriveApproximateLocation", () => {
  it("dérive approxLatitude/approxLongitude à ~1km de précision depuis les coordonnées exactes", () => {
    const event = {
      params: { data: { location: { latitude: 48.856614, longitude: 2.352222 } } },
    };

    deriveApproximateLocation(event);

    expect(event.params.data.location.approxLatitude).toBe(48.86);
    expect(event.params.data.location.approxLongitude).toBe(2.35);
  });

  it("ne fait rien si aucune donnée location n'est présente dans l'événement", () => {
    const event = { params: { data: {} } };

    expect(() => deriveApproximateLocation(event)).not.toThrow();
    expect(event.params.data).not.toHaveProperty("location");
  });

  it("ne fait rien si latitude ou longitude sont manquantes (ne dérive pas de valeur partielle)", () => {
    const event = { params: { data: { location: { latitude: 48.86 } } } };

    deriveApproximateLocation(event);

    expect(event.params.data.location).not.toHaveProperty("approxLatitude");
    expect(event.params.data.location).not.toHaveProperty("approxLongitude");
  });

  it("écrase toute saisie manuelle des champs approx (source de vérité = coordonnées exactes)", () => {
    const event = {
      params: {
        data: {
          location: {
            latitude: 45.764043,
            longitude: 4.835659,
            approxLatitude: 999,
            approxLongitude: 999,
          },
        },
      },
    };

    deriveApproximateLocation(event);

    expect(event.params.data.location.approxLatitude).toBe(45.76);
    expect(event.params.data.location.approxLongitude).toBe(4.84);
  });
});
