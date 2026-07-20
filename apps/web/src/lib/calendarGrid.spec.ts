import { afterEach, describe, expect, it, vi } from "vitest";
import { buildMonthWeeks, firstWeekday } from "./calendarGrid";

function flattenNonNull(weeks: (Date | null)[][]): Date[] {
  return weeks.flat().filter((date): date is Date => date !== null);
}

describe("buildMonthWeeks", () => {
  it("has no leading blank when the month starts on a Monday and startOfWeek=1", () => {
    const weeks = buildMonthWeeks(new Date(Date.UTC(2026, 5, 1)), 1); // June 2026 starts on a Monday
    expect(weeks[0][0]).toEqual(new Date(Date.UTC(2026, 5, 1)));
  });

  it("adds the expected leading blanks when the month starts on a Sunday", () => {
    const weeks = buildMonthWeeks(new Date(Date.UTC(2026, 1, 1)), 1); // February 2026 starts on a Sunday
    const firstWeek = weeks[0];
    expect(firstWeek.slice(0, 6)).toEqual([null, null, null, null, null, null]);
    expect(firstWeek[6]).toEqual(new Date(Date.UTC(2026, 1, 1)));
  });

  it("adds the expected leading blanks when the month starts mid-week", () => {
    const weeks = buildMonthWeeks(new Date(Date.UTC(2026, 3, 1)), 1); // April 2026 starts on a Wednesday
    const firstWeek = weeks[0];
    expect(firstWeek.slice(0, 2)).toEqual([null, null]);
    expect(firstWeek[2]).toEqual(new Date(Date.UTC(2026, 3, 1)));
  });

  it("aligns the same month differently depending on startOfWeek", () => {
    const monthStart = new Date(Date.UTC(2026, 1, 1)); // Sunday
    const weeksFromMonday = buildMonthWeeks(monthStart, 1);
    const weeksFromSunday = buildMonthWeeks(monthStart, 7);

    const leadingBlanks = (weeks: (Date | null)[][]) => weeks[0].filter((d) => d === null).length;
    expect(leadingBlanks(weeksFromMonday)).toBe(6);
    expect(leadingBlanks(weeksFromSunday)).toBe(0);
  });

  it.each([
    { label: "28 days (Feb 2026)", year: 2026, month: 1, days: 28 },
    { label: "29 days (Feb 2028, leap year)", year: 2028, month: 1, days: 29 },
    { label: "30 days (Apr 2026)", year: 2026, month: 3, days: 30 },
    { label: "31 days (Jan 2026)", year: 2026, month: 0, days: 31 },
  ])("contains all days of the month for $label", ({ year, month, days }) => {
    const weeks = buildMonthWeeks(new Date(Date.UTC(year, month, 1)), 1);
    const nonNull = flattenNonNull(weeks);
    expect(nonNull).toHaveLength(days);
    expect(nonNull.map((d) => d.getUTCDate())).toEqual(
      Array.from({ length: days }, (_, i) => i + 1),
    );
  });

  it("returns only complete weeks of 7 cells", () => {
    const weeks = buildMonthWeeks(new Date(Date.UTC(2026, 1, 1)), 1);
    for (const week of weeks) {
      expect(week).toHaveLength(7);
    }
    expect(weeks.flat().length % 7).toBe(0);
  });

  it("places blanks only at the head and tail, never between two days of the month", () => {
    const weeks = buildMonthWeeks(new Date(Date.UTC(2026, 1, 1)), 1);
    const flat = weeks.flat();
    const firstNonNull = flat.findIndex((d) => d !== null);
    const lastNonNull = flat.length - 1 - [...flat].reverse().findIndex((d) => d !== null);
    for (let i = firstNonNull; i <= lastNonNull; i++) {
      expect(flat[i]).not.toBeNull();
    }
  });
});

describe("firstWeekday", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns Monday (1) for the fr locale", () => {
    expect(firstWeekday("fr")).toBe(1);
  });

  it("returns the engine's effective day for the en locale", () => {
    const weekInfo = new Intl.Locale("en").weekInfo;
    expect(firstWeekday("en")).toBe(weekInfo?.firstDay);
  });

  it("falls back to Monday when getWeekInfo/weekInfo are unavailable", () => {
    vi.spyOn(Intl, "Locale").mockImplementation(function (this: object) {
      return this;
    } as unknown as typeof Intl.Locale);

    expect(firstWeekday("fr")).toBe(1);
  });
});
