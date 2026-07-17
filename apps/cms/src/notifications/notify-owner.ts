import type { Core } from "@strapi/strapi";
import { buildBookingRequestEmail, type BookingRequestEmailData } from "./booking-request-email";

export type BookingRequestResult = {
  documentId: string;
  startDate: string;
  endDate: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string | null;
  numberOfGuests?: number | null;
  message?: string | null;
};

/**
 * Sends the owner-notification email for a newly created booking request.
 * Never throws: a delivery failure (bad SMTP creds, provider outage) must
 * not prevent the booking request itself from being created (issue #10
 * acceptance criteria) — it's logged instead.
 */
export async function notifyOwnerOfBookingRequest(
  strapi: Core.Strapi,
  booking: BookingRequestResult,
): Promise<void> {
  const ownerEmail = process.env.OWNER_NOTIFICATION_EMAIL;
  if (!ownerEmail) {
    strapi.log.warn(
      "OWNER_NOTIFICATION_EMAIL is not set — skipping booking request notification email.",
    );
    return;
  }

  const adminUrl = process.env.ADMIN_URL ?? "http://localhost:1337/admin";

  try {
    const full = await strapi
      .documents("api::booking-request.booking-request")
      .findOne({ documentId: booking.documentId, populate: ["property"] });

    const propertyName =
      (full?.property as { name?: string } | null | undefined)?.name ?? "Logement";

    const emailData: BookingRequestEmailData = {
      documentId: booking.documentId,
      propertyName,
      startDate: booking.startDate,
      endDate: booking.endDate,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      numberOfGuests: booking.numberOfGuests,
      message: booking.message,
    };

    const { subject, text, html } = buildBookingRequestEmail(emailData, { adminUrl });

    await strapi.plugin("email").service("email").send({
      to: ownerEmail,
      subject,
      text,
      html,
    });
  } catch (error) {
    strapi.log.error(
      `Failed to send booking request notification email: ${(error as Error).message}`,
    );
  }
}
