export interface BookingRequestInput {
  startDate?: unknown;
  endDate?: unknown;
  guestName?: unknown;
  guestEmail?: unknown;
  property?: unknown;
  [key: string]: unknown;
}

export interface AvailabilityRange {
  startDate: string;
  endDate: string;
}

export type BookingRequestValidationError =
  "MISSING_FIELDS" | "INVALID_DATE_RANGE" | "DATE_IN_PAST" | "DATE_UNAVAILABLE";

function toUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function overlaps(startDay: number, endDay: number, range: AvailabilityRange): boolean {
  const rangeStart = toUtcDay(new Date(range.startDate));
  const rangeEnd = toUtcDay(new Date(range.endDate));
  return startDay <= rangeEnd && endDay >= rangeStart;
}

/**
 * Validates a public booking request payload before it becomes a
 * `BookingRequest` (issue #9). This is the authoritative check: the create
 * endpoint is public, so the web form's own validation (UX feedback) can't be
 * trusted as the sole gate — a request can be sent directly to the API.
 */
export function validateBookingRequestInput(
  input: BookingRequestInput,
  blockedRanges: AvailabilityRange[],
  now: Date = new Date(),
): BookingRequestValidationError | null {
  const { startDate, endDate, guestName, guestEmail, property } = input;

  if (
    !startDate ||
    !endDate ||
    !property ||
    typeof guestName !== "string" ||
    !guestName.trim() ||
    typeof guestEmail !== "string" ||
    !guestEmail.trim()
  ) {
    return "MISSING_FIELDS";
  }

  const start = new Date(startDate as string);
  const end = new Date(endDate as string);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "INVALID_DATE_RANGE";
  }

  const startDay = toUtcDay(start);
  const endDay = toUtcDay(end);

  if (endDay < startDay) {
    return "INVALID_DATE_RANGE";
  }

  if (startDay < toUtcDay(now)) {
    return "DATE_IN_PAST";
  }

  if (blockedRanges.some((range) => overlaps(startDay, endDay, range))) {
    return "DATE_UNAVAILABLE";
  }

  return null;
}
