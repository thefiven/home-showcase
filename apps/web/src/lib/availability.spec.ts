import { describe, expect, it } from "vitest";
import { getBlockedDatesInWindow, isDateBlocked } from "./availability";

describe("isDateBlocked", () => {
  it("blocks a date strictly inside a range", () => {
    const ranges = [{ startDate: "2026-08-01", endDate: "2026-08-05" }];
    expect(isDateBlocked(new Date("2026-08-03"), ranges)).toBe(true);
  });

  it("blocks the range's bounds (inclusive)", () => {
    const ranges = [{ startDate: "2026-08-01", endDate: "2026-08-05" }];
    expect(isDateBlocked(new Date("2026-08-01"), ranges)).toBe(true);
    expect(isDateBlocked(new Date("2026-08-05"), ranges)).toBe(true);
  });

  it("blocks a single day when startDate === endDate", () => {
    const ranges = [{ startDate: "2026-08-10", endDate: "2026-08-10" }];
    expect(isDateBlocked(new Date("2026-08-10"), ranges)).toBe(true);
    expect(isDateBlocked(new Date("2026-08-09"), ranges)).toBe(false);
  });

  it("does not block a date outside any range", () => {
    const ranges = [{ startDate: "2026-08-01", endDate: "2026-08-05" }];
    expect(isDateBlocked(new Date("2026-08-06"), ranges)).toBe(false);
  });

  it("handles overlapping ranges without prior merging", () => {
    const ranges = [
      { startDate: "2026-08-01", endDate: "2026-08-05" },
      { startDate: "2026-08-04", endDate: "2026-08-08" },
    ];
    expect(isDateBlocked(new Date("2026-08-06"), ranges)).toBe(true);
    expect(isDateBlocked(new Date("2026-08-09"), ranges)).toBe(false);
  });

  it("returns false if no range is provided", () => {
    expect(isDateBlocked(new Date("2026-08-01"), [])).toBe(false);
  });
});

describe("getBlockedDatesInWindow", () => {
  it("returns the blocked ISO dates within the requested window", () => {
    const ranges = [{ startDate: "2026-08-03", endDate: "2026-08-04" }];
    const blocked = getBlockedDatesInWindow(ranges, new Date("2026-08-01"), new Date("2026-08-05"));
    expect(blocked).toEqual(new Set(["2026-08-03", "2026-08-04"]));
  });

  it("excludes ranges outside the display window", () => {
    const ranges = [{ startDate: "2026-09-15", endDate: "2026-09-20" }];
    const blocked = getBlockedDatesInWindow(ranges, new Date("2026-08-01"), new Date("2026-08-31"));
    expect(blocked.size).toBe(0);
  });

  it("returns an empty set without a range", () => {
    const blocked = getBlockedDatesInWindow([], new Date("2026-08-01"), new Date("2026-08-05"));
    expect(blocked.size).toBe(0);
  });
});
