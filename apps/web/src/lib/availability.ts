import type { Availability } from "./strapi/types";

function toUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

/**
 * True if `date` falls within one of the blocked ranges (inclusive
 * bounds: a range where `startDate` = `endDate` does block that day).
 * Overlapping ranges don't need to be merged beforehand: each is tested
 * independently.
 */
export function isDateBlocked(
  date: Date,
  ranges: Pick<Availability, "startDate" | "endDate">[],
): boolean {
  const day = toUtcDay(date);
  return ranges.some((range) => {
    const start = toUtcDay(new Date(range.startDate));
    const end = toUtcDay(new Date(range.endDate));
    return day >= start && day <= end;
  });
}

/**
 * Expands the blocked ranges into a set of ISO dates (`YYYY-MM-DD`) for a
 * given display window (e.g. current month + next month), to avoid
 * expanding ranges arbitrarily far into the future.
 */
export function getBlockedDatesInWindow(
  ranges: Pick<Availability, "startDate" | "endDate">[],
  windowStart: Date,
  windowEnd: Date,
): Set<string> {
  const blocked = new Set<string>();
  const cursor = new Date(toUtcDay(windowStart));
  const end = toUtcDay(windowEnd);

  while (toUtcDay(cursor) <= end) {
    if (isDateBlocked(cursor, ranges)) {
      blocked.add(cursor.toISOString().slice(0, 10));
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return blocked;
}
