import { describe, expect, it } from "vitest";
import { validateBookingRequestInput } from "./validation";

const NOW = new Date("2026-07-17T12:00:00.000Z");

const VALID_INPUT = {
  startDate: "2026-08-01",
  endDate: "2026-08-05",
  guestName: "Alex Dupont",
  guestEmail: "alex@example.com",
  property: "prop-doc-id",
};

describe("validateBookingRequestInput", () => {
  it("accepte un cas nominal", () => {
    expect(validateBookingRequestInput(VALID_INPUT, [], NOW)).toBeNull();
  });

  it.each([
    ["startDate", { ...VALID_INPUT, startDate: undefined }],
    ["endDate", { ...VALID_INPUT, endDate: undefined }],
    ["property", { ...VALID_INPUT, property: undefined }],
    ["guestName vide", { ...VALID_INPUT, guestName: "" }],
    ["guestName absent", { ...VALID_INPUT, guestName: undefined }],
    ["guestEmail vide", { ...VALID_INPUT, guestEmail: "" }],
  ])("rejette un champ obligatoire manquant : %s", (_label, input) => {
    expect(validateBookingRequestInput(input, [], NOW)).toBe("MISSING_FIELDS");
  });

  it("rejette une date de fin antérieure à la date de début", () => {
    const input = { ...VALID_INPUT, startDate: "2026-08-05", endDate: "2026-08-01" };
    expect(validateBookingRequestInput(input, [], NOW)).toBe("INVALID_DATE_RANGE");
  });

  it("rejette une date invalide", () => {
    const input = { ...VALID_INPUT, startDate: "not-a-date" };
    expect(validateBookingRequestInput(input, [], NOW)).toBe("INVALID_DATE_RANGE");
  });

  it("rejette une date de début dans le passé", () => {
    const input = { ...VALID_INPUT, startDate: "2026-01-01", endDate: "2026-01-05" };
    expect(validateBookingRequestInput(input, [], NOW)).toBe("DATE_IN_PAST");
  });

  it("accepte une date de début égale à aujourd'hui", () => {
    const input = { ...VALID_INPUT, startDate: "2026-07-17", endDate: "2026-07-20" };
    expect(validateBookingRequestInput(input, [], NOW)).toBeNull();
  });

  it("rejette un chevauchement avec une plage bloquée", () => {
    const blockedRanges = [{ startDate: "2026-08-03", endDate: "2026-08-10" }];
    expect(validateBookingRequestInput(VALID_INPUT, blockedRanges, NOW)).toBe("DATE_UNAVAILABLE");
  });

  it("accepte des dates adjacentes à une plage bloquée sans la chevaucher", () => {
    const blockedRanges = [{ startDate: "2026-08-06", endDate: "2026-08-10" }];
    expect(validateBookingRequestInput(VALID_INPUT, blockedRanges, NOW)).toBeNull();
  });
});
