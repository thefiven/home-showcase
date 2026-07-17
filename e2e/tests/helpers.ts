import { STRAPI_URL } from "./config";

export interface CreatedBookingRequest {
  documentId: string;
}

/** Formats a `Date` as the `YYYY-MM-DD` string the booking form's `<input type="date">` expects. */
export function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function futureDateRange(startOffsetDays: number, nights: number) {
  const start = new Date();
  start.setUTCDate(start.getUTCDate() + startOffsetDays);
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + nights);
  return { start: formatDate(start), end: formatDate(end) };
}

/**
 * Creates a booking request through the same public, unauthenticated
 * endpoint the visitor-facing form uses — used to seed data for the admin
 * spec without depending on `booking-request.spec.ts` having run first.
 */
export async function createBookingRequest(
  propertyDocumentId: string,
  overrides: Partial<{
    startDate: string;
    endDate: string;
    guestName: string;
    guestEmail: string;
  }> = {},
): Promise<CreatedBookingRequest> {
  const { start, end } = futureDateRange(60, 4);
  const res = await fetch(`${STRAPI_URL}/api/booking-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: {
        property: propertyDocumentId,
        startDate: overrides.startDate ?? start,
        endDate: overrides.endDate ?? end,
        guestName: overrides.guestName ?? "Admin Spec Fixture",
        guestEmail: overrides.guestEmail ?? "admin-spec-fixture@example.com",
      },
    }),
  });
  if (!res.ok) {
    throw new Error(`Échec de la création de la demande de réservation : ${await res.text()}`);
  }
  const { data } = (await res.json()) as { data: CreatedBookingRequest };
  return data;
}

export async function getPropertyDocumentId(slug: string): Promise<string> {
  const res = await fetch(`${STRAPI_URL}/api/properties?filters[slug][$eq]=${slug}&locale=fr`);
  const { data } = (await res.json()) as { data: Array<{ documentId: string }> };
  if (data.length === 0) {
    throw new Error(`Logement e2e "${slug}" introuvable — le global-setup a-t-il tourné ?`);
  }
  return data[0].documentId;
}
