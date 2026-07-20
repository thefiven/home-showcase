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
  it("accepts a valid input without errors", () => {
    expect(validateBookingRequest(VALID_INPUT, [], NOW)).toEqual({});
  });

  it("flags missing required fields", () => {
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

  it("rejects an end date before the start date", () => {
    const input = { ...VALID_INPUT, startDate: "2026-08-05", endDate: "2026-08-01" };
    expect(validateBookingRequest(input, [], NOW)).toEqual({ dates: "invalidRange" });
  });

  it("rejects a start date in the past", () => {
    const input = { ...VALID_INPUT, startDate: "2026-01-01", endDate: "2026-01-05" };
    expect(validateBookingRequest(input, [], NOW)).toEqual({ dates: "pastDate" });
  });

  it("accepts a start date equal to today", () => {
    const input = { ...VALID_INPUT, startDate: "2026-07-17", endDate: "2026-07-20" };
    expect(validateBookingRequest(input, [], NOW)).toEqual({});
  });

  it("rejects an overlap with a blocked range", () => {
    const blockedRanges = [{ startDate: "2026-08-03", endDate: "2026-08-10" }];
    expect(validateBookingRequest(VALID_INPUT, blockedRanges, NOW)).toEqual({
      dates: "unavailable",
    });
  });

  it("accepts dates adjacent to a blocked range without overlapping it", () => {
    const blockedRanges = [{ startDate: "2026-08-06", endDate: "2026-08-10" }];
    expect(validateBookingRequest(VALID_INPUT, blockedRanges, NOW)).toEqual({});
  });
});
