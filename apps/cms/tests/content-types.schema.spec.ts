import { describe, expect, it } from "vitest";
import bookingRequestSchema from "../src/api/booking-request/content-types/booking-request/schema.json";
import availabilitySchema from "../src/api/availability/content-types/availability/schema.json";
import propertySchema from "../src/api/property/content-types/property/schema.json";

// Garde-fou pour les critères d'acceptation de l'issue #3 : une régression
// silencieuse de ces champs (ex. un statut par défaut oublié) casserait le
// workflow de réservation sans faire échouer le build Strapi.
describe("booking-request schema", () => {
  it("déclare le statut (bookingStatus, pas status — réservé par Strapi) comme un enum pending/accepted/refused, requis, par défaut pending", () => {
    const status = bookingRequestSchema.attributes.bookingStatus;

    expect(status.type).toBe("enumeration");
    expect(status.enum).toEqual(["pending", "accepted", "refused"]);
    expect(status.default).toBe("pending");
    expect(status.required).toBe(true);
  });

  it("est liée à Property", () => {
    const property = bookingRequestSchema.attributes.property;

    expect(property.type).toBe("relation");
    expect(property.relation).toBe("manyToOne");
    expect(property.target).toBe("api::property.property");
  });

  it("n'est pas localisée (une demande de réservation n'a pas de traduction)", () => {
    expect(bookingRequestSchema.pluginOptions?.i18n?.localized).toBe(false);
  });

  it("déclare statusChangedAt comme un datetime pour tracer le changement de statut", () => {
    expect(bookingRequestSchema.attributes.statusChangedAt.type).toBe("datetime");
  });
});

describe("availability schema", () => {
  it("est liée à Property", () => {
    const property = availabilitySchema.attributes.property;

    expect(property.type).toBe("relation");
    expect(property.relation).toBe("manyToOne");
    expect(property.target).toBe("api::property.property");
  });

  it("a une source enum airbnb/manual par défaut airbnb", () => {
    const source = availabilitySchema.attributes.source;

    expect(source.type).toBe("enumeration");
    expect(source.enum).toEqual(["airbnb", "manual"]);
    expect(source.default).toBe("airbnb");
  });
});

describe("property schema", () => {
  it("expose icalUrl comme champ privé (jamais dans l’API publique)", () => {
    expect(propertySchema.attributes.icalUrl.private).toBe(true);
  });

  it("est localisée FR/EN", () => {
    expect(propertySchema.pluginOptions?.i18n?.localized).toBe(true);
  });

  it("a un slug non localisé (clé de routing stable entre langues)", () => {
    expect(propertySchema.attributes.slug.pluginOptions?.i18n?.localized).toBe(false);
  });
});
