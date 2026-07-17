"use server";

import { validateBookingRequest, type BookingFormErrors } from "@/lib/booking";
import { createBookingRequest, getAvailabilitiesForProperty } from "@/lib/strapi/client";

export interface BookingRequestState {
  status: "idle" | "success" | "error";
  errors: BookingFormErrors;
  errorMessage?: string;
}

function readTrimmed(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

/**
 * Server Action bound to a `propertyDocumentId` (issue #9). Re-validates
 * authoritatively against `validateBookingRequest` (same rules as the client
 * feedback, but never trusted from the client alone) before calling Strapi,
 * which re-validates again — Strapi's create endpoint is public and callable
 * outside this form.
 */
export async function submitBookingRequest(
  propertyDocumentId: string,
  _prevState: BookingRequestState,
  formData: FormData,
): Promise<BookingRequestState> {
  const input = {
    startDate: readTrimmed(formData, "startDate"),
    endDate: readTrimmed(formData, "endDate"),
    guestName: readTrimmed(formData, "guestName"),
    guestEmail: readTrimmed(formData, "guestEmail"),
  };
  const guestPhone = readTrimmed(formData, "guestPhone");
  const message = readTrimmed(formData, "message");
  const numberOfGuestsRaw = readTrimmed(formData, "numberOfGuests");

  const blockedRanges = await getAvailabilitiesForProperty(propertyDocumentId);
  const errors = validateBookingRequest(input, blockedRanges);

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors };
  }

  try {
    await createBookingRequest({
      property: propertyDocumentId,
      startDate: input.startDate,
      endDate: input.endDate,
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      ...(guestPhone && { guestPhone }),
      ...(message && { message }),
      ...(numberOfGuestsRaw && { numberOfGuests: Number(numberOfGuestsRaw) }),
    });
  } catch (error) {
    return {
      status: "error",
      errors: {},
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

  return { status: "success", errors: {} };
}
