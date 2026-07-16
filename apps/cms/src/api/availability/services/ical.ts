import * as ical from "node-ical";
import type { CalendarComponent, ParameterValue, VEvent } from "node-ical";

export type ParsedEvent = {
  externalUid: string;
  startDate: Date;
  endDate: Date;
  summary?: string;
};

export type AvailabilityRecord = {
  documentId: string;
  externalUid?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  summary?: string | null;
};

export type ReconcileResult = {
  toCreate: ParsedEvent[];
  toUpdate: Array<{ documentId: string; event: ParsedEvent }>;
  toDelete: Array<{ documentId: string }>;
};

function toPlainSummary(summary: ParameterValue | undefined): string | undefined {
  if (typeof summary === "string") return summary;
  if (summary && typeof summary === "object" && "val" in summary) {
    return String((summary as { val: unknown }).val);
  }
  return undefined;
}

function isVEvent(component: CalendarComponent): component is VEvent {
  return component.type === "VEVENT";
}

/**
 * Parses raw iCal text into the availability blocks we care about.
 * Events without a UID or without valid start/end dates are skipped
 * rather than throwing, since a single malformed VEVENT shouldn't
 * abort the whole sync (CLAUDE.md/SPEC §5: sync errors must not crash).
 */
export function parseIcalEvents(icalString: string): ParsedEvent[] {
  let parsed: ical.CalendarResponse;
  try {
    parsed = ical.sync.parseICS(icalString);
  } catch {
    return [];
  }

  const events: ParsedEvent[] = [];

  for (const component of Object.values(parsed)) {
    if (!component || !isVEvent(component)) continue;
    if (!component.uid || !component.start || !component.end) continue;

    const startDate = new Date(component.start);
    const endDate = new Date(component.end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) continue;

    events.push({
      externalUid: component.uid,
      startDate,
      endDate,
      summary: toPlainSummary(component.summary),
    });
  }

  return events;
}

/**
 * Availability dates are all-day (no time component). node-ical yields
 * local-midnight `Date` objects for `VALUE=DATE` events, while Strapi's
 * `date` field round-trips as a plain "YYYY-MM-DD" string — comparing raw
 * timestamps between the two would spuriously differ on any non-UTC server.
 * Comparing the calendar-day components directly sidesteps that entirely.
 */
function toDateOnlyString(value: string | Date): string {
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return value.slice(0, 10);
}

function sameDate(a: string | Date | null | undefined, b: Date): boolean {
  return a != null && toDateOnlyString(a) === toDateOnlyString(b);
}

/**
 * Diffs the currently stored `airbnb`-sourced availabilities against the
 * freshly parsed iCal events, keyed by `externalUid`. Pure function: no
 * DB/network access, so the create/update/delete decision is unit-testable
 * in isolation from Strapi.
 */
export function reconcile(existing: AvailabilityRecord[], parsed: ParsedEvent[]): ReconcileResult {
  const existingByUid = new Map(
    existing
      .filter((record) => record.externalUid)
      .map((record) => [record.externalUid as string, record]),
  );
  const parsedByUid = new Map(parsed.map((event) => [event.externalUid, event]));

  const toCreate: ParsedEvent[] = [];
  const toUpdate: Array<{ documentId: string; event: ParsedEvent }> = [];
  const toDelete: Array<{ documentId: string }> = [];

  for (const event of parsed) {
    const existingRecord = existingByUid.get(event.externalUid);
    if (!existingRecord) {
      toCreate.push(event);
      continue;
    }

    const changed =
      !sameDate(existingRecord.startDate, event.startDate) ||
      !sameDate(existingRecord.endDate, event.endDate) ||
      (existingRecord.summary ?? undefined) !== event.summary;

    if (changed) {
      toUpdate.push({ documentId: existingRecord.documentId, event });
    }
  }

  for (const record of existing) {
    if (record.externalUid && !parsedByUid.has(record.externalUid)) {
      toDelete.push({ documentId: record.documentId });
    }
  }

  return { toCreate, toUpdate, toDelete };
}
