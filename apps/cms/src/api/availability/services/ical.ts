import * as ical from "node-ical";
import type { CalendarComponent, ParameterValue, VEvent } from "node-ical";

export type ParsedEvent = {
  externalUid: string;
  startDate: Date;
  endDate: Date;
  summary?: string;
};

export type AvailabilityRecord = {
  id: string | number;
  externalUid: string | null;
  startDate: string | Date;
  endDate: string | Date;
  summary?: string | null;
};

export type ReconcileResult = {
  toCreate: ParsedEvent[];
  toUpdate: Array<{ id: string | number; event: ParsedEvent }>;
  toDelete: Array<{ id: string | number }>;
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

function sameInstant(a: string | Date, b: Date): boolean {
  return new Date(a).getTime() === b.getTime();
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
  const toUpdate: Array<{ id: string | number; event: ParsedEvent }> = [];
  const toDelete: Array<{ id: string | number }> = [];

  for (const event of parsed) {
    const existingRecord = existingByUid.get(event.externalUid);
    if (!existingRecord) {
      toCreate.push(event);
      continue;
    }

    const changed =
      !sameInstant(existingRecord.startDate, event.startDate) ||
      !sameInstant(existingRecord.endDate, event.endDate) ||
      (existingRecord.summary ?? undefined) !== event.summary;

    if (changed) {
      toUpdate.push({ id: existingRecord.id, event });
    }
  }

  for (const record of existing) {
    if (record.externalUid && !parsedByUid.has(record.externalUid)) {
      toDelete.push({ id: record.id });
    }
  }

  return { toCreate, toUpdate, toDelete };
}
