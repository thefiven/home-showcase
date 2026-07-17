import { describe, expect, it } from "vitest";
import { validateBookingRequest } from "./booking";

const NOW = new Date("2026-07-17T12:00:00.000Z");

const VALID_INPUT = {
  startDate: "2026-08-01",
  endDate: "2026-08-05",
  guestName: "Alex Dupont",
  guestEmail: "alex@example.com",
};

describe("validateBookingRequest", () => {
  it("accepte un cas nominal sans erreurs", () => {
    expect(validateBookingRequest(VALID_INPUT, [], NOW)).toEqual({});
  });

  it("signale les champs obligatoires manquants", () => {
    const errors = validateBookingRequest(
      { startDate: "", endDate: "", guestName: "", guestEmail: "" },
      [],
      NOW,
    );
    expect(errors).toEqual({
      guestName: "required",
      guestEmail: "required",
      startDate: "required",
      endDate: "required",
    });
  });

  it("rejette une date de fin antérieure à la date de début", () => {
    const input = { ...VALID_INPUT, startDate: "2026-08-05", endDate: "2026-08-01" };
    expect(validateBookingRequest(input, [], NOW)).toEqual({ dates: "invalidRange" });
  });

  it("rejette une date de début dans le passé", () => {
    const input = { ...VALID_INPUT, startDate: "2026-01-01", endDate: "2026-01-05" };
    expect(validateBookingRequest(input, [], NOW)).toEqual({ dates: "pastDate" });
  });

  it("accepte une date de début égale à aujourd'hui", () => {
    const input = { ...VALID_INPUT, startDate: "2026-07-17", endDate: "2026-07-20" };
    expect(validateBookingRequest(input, [], NOW)).toEqual({});
  });

  it("rejette un chevauchement avec une plage bloquée", () => {
    const blockedRanges = [{ startDate: "2026-08-03", endDate: "2026-08-10" }];
    expect(validateBookingRequest(VALID_INPUT, blockedRanges, NOW)).toEqual({
      dates: "unavailable",
    });
  });

  it("accepte des dates adjacentes à une plage bloquée sans la chevaucher", () => {
    const blockedRanges = [{ startDate: "2026-08-06", endDate: "2026-08-10" }];
    expect(validateBookingRequest(VALID_INPUT, blockedRanges, NOW)).toEqual({});
  });
});
