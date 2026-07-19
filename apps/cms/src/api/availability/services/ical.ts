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
 *
 * node-ical never throws on malformed input — it silently returns whatever
 * partial data it could salvage, so a truncated response or an HTML error
 * page would otherwise parse to zero events. Treated as real data, that
 * would make reconcile() think every existing booking got cancelled and
 * delete them all. Requiring the "BEGIN:VCALENDAR" marker lets us tell a
 * genuinely empty calendar (no bookings) apart from an unreadable one, and
 * throw for the latter so the caller logs it as a sync error instead of
 * wiping availability (issue #7: "erreurs de sync... loguées sans crasher").
 * Events without a UID or without valid start/end dates are still skipped
 * individually rather than aborting the whole parse.
 */
export function parseIcalEvents(icalString: string): ParsedEvent[] {
  if (!icalString.includes("BEGIN:VCALENDAR")) {
    throw new Error("Response is not a valid iCal document");
  }

  const parsed: ical.CalendarResponse = ical.sync.parseICS(icalString);

  const events: ParsedEvent[] = [];

  for (const component of Object.values(parsed)) {
    if (!component || !isVEvent(component)) continue;
    if (!component.uid || !component.start || !component.end) continue;

    const startDate = new Date(component.start);
    let endDate = new Date(component.end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) continue;

    // RFC 5545 : DTEND d'un événement journée entière (VALUE=DATE) est
    // exclusif — il désigne le lendemain du dernier jour occupé, pas ce
    // jour-là. Le reste du système (isDateBlocked, overlaps, saisie
    // manuelle) traite startDate/endDate en bornes inclusives : sans cette
    // conversion, le jour de turnover (départ + nouvelle arrivée le même
    // jour) serait bloqué à tort. Décalage en jour civil local (pas en
    // millisecondes) pour rester correct autour des changements d'heure.
    if (component.datetype === "date") {
      endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() - 1);
    }

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
