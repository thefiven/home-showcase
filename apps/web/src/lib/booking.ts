import { getBlockedDatesInWindow } from "./availability";
import type { Availability } from "./strapi/types";

export interface BookingFormInput {
  startDate: string;
  endDate: string;
  guestName: string;
  guestEmail: string;
}

export type BookingFieldError = "required" | "invalidRange" | "pastDate" | "unavailable";

export interface BookingFormErrors {
  guestName?: BookingFieldError;
  guestEmail?: BookingFieldError;
  startDate?: BookingFieldError;
  endDate?: BookingFieldError;
  dates?: BookingFieldError;
}

/**
 * Web-side validation: instant feedback for the visitor before submission.
 * This is NOT the authority — Strapi revalidates everything server-side
 * (the create endpoint is public, callable outside the form). Returns
 * per-field error codes rather than messages, to stay localizable by the
 * caller (i18n dictionary).
 */
export function validateBookingRequest(
  input: BookingFormInput,
  blockedRanges: Pick<Availability, "startDate" | "endDate">[],
  now: Date = new Date(),
): BookingFormErrors {
  const errors: BookingFormErrors = {};

  if (!input.guestName.trim()) errors.guestName = "required";
  if (!input.guestEmail.trim()) errors.guestEmail = "required";
  if (!input.startDate) errors.startDate = "required";
  if (!input.endDate) errors.endDate = "required";

  if (errors.startDate || errors.endDate) {
    return errors;
  }

  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) {
    errors.dates = "invalidRange";
    return errors;
  }

  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  if (start < today) {
    errors.dates = "pastDate";
    return errors;
  }

  const blockedDates = getBlockedDatesInWindow(blockedRanges, start, end);
  if (blockedDates.size > 0) {
    errors.dates = "unavailable";
  }

  return errors;
}
