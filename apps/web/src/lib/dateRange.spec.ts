import { describe, expect, it } from "vitest";
import {
  applyDateClick,
  cellState,
  isPastDate,
  rangeContainsBlocked,
  selectDate,
  type DateRange,
} from "./dateRange";

const EMPTY: DateRange = { start: null, end: null };

describe("applyDateClick", () => {
  it("sets the start date when the range is empty", () => {
    expect(applyDateClick(EMPTY, "2026-08-10")).toEqual({ start: "2026-08-10", end: null });
  });

  it("sets the end date when a start is already set", () => {
    const range = { start: "2026-08-10", end: null };
    expect(applyDateClick(range, "2026-08-15")).toEqual({ start: "2026-08-10", end: "2026-08-15" });
  });

  it("produces a single-day range when clicking the same date twice", () => {
    const range = { start: "2026-08-10", end: null };
    expect(applyDateClick(range, "2026-08-10")).toEqual({ start: "2026-08-10", end: "2026-08-10" });
  });

  it("restarts the selection if the click is before the start", () => {
    const range = { start: "2026-08-10", end: null };
    expect(applyDateClick(range, "2026-08-05")).toEqual({ start: "2026-08-05", end: null });
  });

  it("restarts the selection if the range was already complete", () => {
    const range = { start: "2026-08-10", end: "2026-08-15" };
    expect(applyDateClick(range, "2026-08-20")).toEqual({ start: "2026-08-20", end: null });
  });
});

describe("rangeContainsBlocked", () => {
  it("detects a blocked date strictly inside the range", () => {
    const blocked = new Set(["2026-08-12"]);
    expect(rangeContainsBlocked("2026-08-10", "2026-08-15", blocked)).toBe(true);
  });

  it("detects a blocked date on a bound (inclusive bounds)", () => {
    const blocked = new Set(["2026-08-10"]);
    expect(rangeContainsBlocked("2026-08-10", "2026-08-15", blocked)).toBe(true);
  });

  it("returns false when no date in the range is blocked", () => {
    const blocked = new Set(["2026-09-01"]);
    expect(rangeContainsBlocked("2026-08-10", "2026-08-15", blocked)).toBe(false);
  });
});

describe("selectDate", () => {
  it("behaves like applyDateClick without a blocked date", () => {
    const range = { start: "2026-08-10", end: null };
    expect(selectDate(range, "2026-08-15", new Set())).toEqual({
      start: "2026-08-10",
      end: "2026-08-15",
    });
  });

  it("restarts on the clicked date if the range crosses a blocked date", () => {
    const range = { start: "2026-08-10", end: null };
    const blocked = new Set(["2026-08-12"]);
    expect(selectDate(range, "2026-08-15", blocked)).toEqual({ start: "2026-08-15", end: null });
  });
});

describe("cellState", () => {
  it("returns none without a selection", () => {
    expect(cellState("2026-08-10", EMPTY)).toBe("none");
  });

  it("returns start when only the start is set", () => {
    expect(cellState("2026-08-10", { start: "2026-08-10", end: null })).toBe("start");
    expect(cellState("2026-08-11", { start: "2026-08-10", end: null })).toBe("none");
  });

  it("returns start/end/between on a complete range", () => {
    const range = { start: "2026-08-10", end: "2026-08-13" };
    expect(cellState("2026-08-10", range)).toBe("start");
    expect(cellState("2026-08-11", range)).toBe("between");
    expect(cellState("2026-08-12", range)).toBe("between");
    expect(cellState("2026-08-13", range)).toBe("end");
    expect(cellState("2026-08-14", range)).toBe("none");
  });

  it("returns start on a single-day range", () => {
    const range = { start: "2026-08-10", end: "2026-08-10" };
    expect(cellState("2026-08-10", range)).toBe("start");
  });
});

describe("isPastDate", () => {
  it("detects a strictly earlier date", () => {
    expect(isPastDate("2026-08-01", "2026-08-02")).toBe(true);
  });

  it("does not consider today as past", () => {
    expect(isPastDate("2026-08-02", "2026-08-02")).toBe(false);
  });

  it("does not consider a future date as past", () => {
    expect(isPastDate("2026-08-03", "2026-08-02")).toBe(false);
  });
});
