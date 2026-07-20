import { describe, expect, it } from "vitest";
import { parseIcalEvents, reconcile } from "./ical";

const AIRBNB_ICAL = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Airbnb Inc//Hosting Calendar 0.8.8//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260801
DTEND;VALUE=DATE:20260805
DTSTAMP:20260716T120000Z
UID:reservation-1@airbnb.com
SUMMARY:Reserved
END:VEVENT
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260810
DTEND;VALUE=DATE:20260812
DTSTAMP:20260716T120000Z
UID:reservation-2@airbnb.com
SUMMARY:Airbnb (Not available)
END:VEVENT
END:VCALENDAR`;

describe("parseIcalEvents", () => {
  it("maps each VEVENT to a parsed event with uid, dates and summary", () => {
    const events = parseIcalEvents(AIRBNB_ICAL);

    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({
      externalUid: "reservation-1@airbnb.com",
      startDate: new Date(2026, 7, 1),
      // DTEND:20260805 is exclusive (RFC 5545): converted to an inclusive
      // bound, August 4 is the last day actually blocked.
      endDate: new Date(2026, 7, 4),
      summary: "Reserved",
    });
    expect(events[1].externalUid).toBe("reservation-2@airbnb.com");
  });

  it("converts a single-day range (DTSTART=DTEND-1) into a single blocked day", () => {
    const oneDayBuffer = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Airbnb Inc//Hosting Calendar 0.8.8//EN
CALSCALE:GREGORIAN
BEGIN:VEVENT
DTSTART;VALUE=DATE:20260821
DTEND;VALUE=DATE:20260822
DTSTAMP:20260716T120000Z
UID:turnover-day@airbnb.com
SUMMARY:Airbnb (Not available)
END:VEVENT
END:VCALENDAR`;

    const events = parseIcalEvents(oneDayBuffer);

    expect(events).toHaveLength(1);
    expect(events[0].startDate).toEqual(new Date(2026, 7, 21));
    expect(events[0].endDate).toEqual(new Date(2026, 7, 21));
  });

  it("ignores events without a UID", () => {
    const icalWithoutUid = AIRBNB_ICAL.replace("UID:reservation-1@airbnb.com\n", "");

    const events = parseIcalEvents(icalWithoutUid);

    expect(events).toHaveLength(1);
    expect(events[0].externalUid).toBe("reservation-2@airbnb.com");
  });

  it("ignores events without a DTSTART", () => {
    const icalWithoutDtstart = AIRBNB_ICAL.replace("DTSTART;VALUE=DATE:20260801\n", "");

    const events = parseIcalEvents(icalWithoutDtstart);

    expect(events).toHaveLength(1);
    expect(events[0].externalUid).toBe("reservation-2@airbnb.com");
  });

  it("returns an empty array for a valid but empty calendar", () => {
    expect(parseIcalEvents("BEGIN:VCALENDAR\nVERSION:2.0\nEND:VCALENDAR")).toEqual([]);
  });

  it("throws for an empty or non-iCal string, so callers log it as a sync error instead of treating it as a valid empty calendar", () => {
    expect(() => parseIcalEvents("")).toThrow();
    expect(() => parseIcalEvents("not an ical file")).toThrow();
    expect(() => parseIcalEvents("<html>502 Bad Gateway</html>")).toThrow();
  });
});

describe("reconcile", () => {
  const newBooking = {
    externalUid: "new@airbnb.com",
    startDate: new Date("2026-09-01T00:00:00.000Z"),
    endDate: new Date("2026-09-03T00:00:00.000Z"),
    summary: "Reserved",
  };

  it("marks a new iCal event as toCreate when it doesn't exist yet", () => {
    const result = reconcile([], [newBooking]);

    expect(result.toCreate).toEqual([newBooking]);
    expect(result.toUpdate).toEqual([]);
    expect(result.toDelete).toEqual([]);
  });

  it("marks a stored availability as toDelete when its UID is no longer in the iCal (cancellation)", () => {
    const existing = [
      {
        documentId: "doc-1",
        externalUid: "cancelled@airbnb.com",
        startDate: "2026-08-01T00:00:00.000Z",
        endDate: "2026-08-05T00:00:00.000Z",
        summary: "Reserved",
      },
    ];

    const result = reconcile(existing, []);

    expect(result.toDelete).toEqual([{ documentId: "doc-1" }]);
    expect(result.toCreate).toEqual([]);
    expect(result.toUpdate).toEqual([]);
  });

  it("marks an existing UID as toUpdate when its dates changed", () => {
    const existing = [
      {
        documentId: "doc-42",
        externalUid: newBooking.externalUid,
        startDate: "2026-09-01T00:00:00.000Z",
        endDate: "2026-09-02T00:00:00.000Z",
        summary: "Reserved",
      },
    ];

    const result = reconcile(existing, [newBooking]);

    expect(result.toUpdate).toEqual([{ documentId: "doc-42", event: newBooking }]);
    expect(result.toCreate).toEqual([]);
    expect(result.toDelete).toEqual([]);
  });

  it("does not delete manual availabilities, since they are excluded from `existing` upstream", () => {
    const manualEntry = [
      {
        documentId: "doc-7",
        externalUid: null,
        startDate: "2026-08-01T00:00:00.000Z",
        endDate: "2026-08-05T00:00:00.000Z",
        summary: null,
      },
    ];

    const result = reconcile(manualEntry, []);

    expect(result.toDelete).toEqual([]);
  });

  it("returns empty create/update/delete lists when nothing changed", () => {
    const existing = [
      {
        documentId: "doc-42",
        externalUid: newBooking.externalUid,
        startDate: "2026-09-01T00:00:00.000Z",
        endDate: "2026-09-03T00:00:00.000Z",
        summary: "Reserved",
      },
    ];

    const result = reconcile(existing, [newBooking]);

    expect(result).toEqual({ toCreate: [], toUpdate: [], toDelete: [] });
  });

  it("does not flag an unchanged all-day event as toUpdate regardless of server timezone", () => {
    // Mirrors what parseIcalEvents actually produces for a VALUE=DATE event
    // (a local-midnight Date, per node-ical), against how Strapi's `date`
    // field round-trips it (a plain "YYYY-MM-DD" string, no timezone).
    const event = {
      externalUid: "same-day@airbnb.com",
      startDate: new Date(2026, 8, 1),
      endDate: new Date(2026, 8, 3),
      summary: "Reserved",
    };
    const existing = [
      {
        documentId: "doc-99",
        externalUid: "same-day@airbnb.com",
        startDate: "2026-09-01",
        endDate: "2026-09-03",
        summary: "Reserved",
      },
    ];

    const result = reconcile(existing, [event]);

    expect(result).toEqual({ toCreate: [], toUpdate: [], toDelete: [] });
  });
});
