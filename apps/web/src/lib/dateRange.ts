export interface DateRange {
  start: string | null;
  end: string | null;
}

/** True if any day of `[start, end]` (bounds included) is in `blocked`. */
export function rangeContainsBlocked(start: string, end: string, blocked: Set<string>): boolean {
  const cursor = new Date(`${start}T00:00:00Z`);
  const last = new Date(`${end}T00:00:00Z`).getTime();

  while (cursor.getTime() <= last) {
    if (blocked.has(cursor.toISOString().slice(0, 10))) return true;
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return false;
}

/**
 * State machine for clicking a calendar cell: no start, or an already
 * complete range → restarts on `iso`. A start already set and a click on
 * an earlier date also restarts (rather than silently rejecting). A click
 * on the same date as the start produces a single-day range.
 */
export function applyDateClick(range: DateRange, iso: string): DateRange {
  if (!range.start || range.end) {
    return { start: iso, end: null };
  }
  if (iso < range.start) {
    return { start: iso, end: null };
  }
  return { start: range.start, end: iso };
}

/**
 * Applies the click then restarts the selection on `iso` if the
 * resulting range overlaps a date blocked by the iCal sync (criterion
 * from #69: no range must cross an unavailable date).
 */
export function selectDate(range: DateRange, iso: string, blocked: Set<string>): DateRange {
  const next = applyDateClick(range, iso);
  if (next.start && next.end && rangeContainsBlocked(next.start, next.end, blocked)) {
    return { start: iso, end: null };
  }
  return next;
}

export type CellState = "start" | "end" | "between" | "none";

/** Display state of a calendar cell with respect to the current selection. */
export function cellState(iso: string, range: DateRange): CellState {
  if (!range.start) return "none";
  if (!range.end) return iso === range.start ? "start" : "none";
  if (iso === range.start && iso === range.end) return "start";
  if (iso === range.start) return "start";
  if (iso === range.end) return "end";
  if (iso > range.start && iso < range.end) return "between";
  return "none";
}

/** True if `iso` is strictly before `todayIso` (lexicographic comparison, `YYYY-MM-DD` format). */
export function isPastDate(iso: string, todayIso: string): boolean {
  return iso < todayIso;
}
