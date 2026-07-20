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
  it("accepts a valid input", () => {
    expect(validateBookingRequestInput(VALID_INPUT, [], NOW)).toBeNull();
  });

  it.each([
    ["startDate", { ...VALID_INPUT, startDate: undefined }],
    ["endDate", { ...VALID_INPUT, endDate: undefined }],
    ["property", { ...VALID_INPUT, property: undefined }],
    ["empty guestName", { ...VALID_INPUT, guestName: "" }],
    ["missing guestName", { ...VALID_INPUT, guestName: undefined }],
    ["empty guestEmail", { ...VALID_INPUT, guestEmail: "" }],
  ])("rejects a missing required field: %s", (_label, input) => {
    expect(validateBookingRequestInput(input, [], NOW)).toBe("MISSING_FIELDS");
  });

  it("rejects an end date before the start date", () => {
    const input = { ...VALID_INPUT, startDate: "2026-08-05", endDate: "2026-08-01" };
    expect(validateBookingRequestInput(input, [], NOW)).toBe("INVALID_DATE_RANGE");
  });

  it("rejects an invalid date", () => {
    const input = { ...VALID_INPUT, startDate: "not-a-date" };
    expect(validateBookingRequestInput(input, [], NOW)).toBe("INVALID_DATE_RANGE");
  });

  it("rejects a start date in the past", () => {
    const input = { ...VALID_INPUT, startDate: "2026-01-01", endDate: "2026-01-05" };
    expect(validateBookingRequestInput(input, [], NOW)).toBe("DATE_IN_PAST");
  });

  it("accepts a start date equal to today", () => {
    const input = { ...VALID_INPUT, startDate: "2026-07-17", endDate: "2026-07-20" };
    expect(validateBookingRequestInput(input, [], NOW)).toBeNull();
  });

  it("rejects an overlap with a blocked range", () => {
    const blockedRanges = [{ startDate: "2026-08-03", endDate: "2026-08-10" }];
    expect(validateBookingRequestInput(VALID_INPUT, blockedRanges, NOW)).toBe("DATE_UNAVAILABLE");
  });

  it("accepts dates adjacent to a blocked range without overlapping it", () => {
    const blockedRanges = [{ startDate: "2026-08-06", endDate: "2026-08-10" }];
    expect(validateBookingRequestInput(VALID_INPUT, blockedRanges, NOW)).toBeNull();
  });
});
