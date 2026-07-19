import type { Core } from "@strapi/strapi";
import {
  notifyOwnerOfBookingRequest,
  type BookingRequestResult,
} from "../../../../notifications/notify-owner";

interface UpdateEvent {
  params: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  };
}

interface CreateEvent {
  result: BookingRequestResult;
}

interface AfterUpdateEvent {
  result: { documentId: string };
  params: { data: Record<string, unknown> };
}

const AVAILABILITY_SOURCE = "manual" as const;

function bookingAvailabilityUid(documentId: string): string {
  return `booking:${documentId}`;
}

/**
 * Stamps `statusChangedAt` whenever `bookingStatus` actually changes, so the
 * owner's accept/refuse decision stays traceable (issue #9 acceptance
 * criteria) without relying on `updatedAt`, which also changes on unrelated
 * edits. The field is named `bookingStatus`, not `status`: Strapi v5 reserves
 * `status` as the Document Service's own draft/publish query parameter and
 * silently overwrites (with `undefined`, which then disappears from the JSON
 * response) any content-manager attribute sharing that name.
 */
export async function stampStatusChangeOnUpdate(
  event: UpdateEvent,
  { strapi }: { strapi: Core.Strapi },
): Promise<void> {
  const { data, where } = event.params;
  if (typeof data.bookingStatus !== "string") return;

  const existing = await strapi.db
    .query("api::booking-request.booking-request")
    .findOne({ where, select: ["bookingStatus"] });

  if (existing && existing.bookingStatus !== data.bookingStatus) {
    data.statusChangedAt = new Date();
  }
}

/**
 * Sends the owner-notification email (issue #10) for every new booking
 * request, whichever path created it (public API — issue #9 — or admin).
 * Delegated to notifyOwnerOfBookingRequest, which never throws so a
 * notification failure can't roll back or fail the creation.
 */
export async function notifyOwnerOnCreate(
  event: CreateEvent,
  { strapi }: { strapi: Core.Strapi },
): Promise<void> {
  await notifyOwnerOfBookingRequest(strapi, event.result);
}

/**
 * Keeps the Property's Availability calendar in sync with the booking's
 * final status (SPEC.md §4: "à terme, la mise à jour de la disponibilité
 * affichée"): an `accepted` booking blocks its dates, and un-accepting it
 * (back to `pending`/`refused`) frees them again. Idempotent on the booking's
 * current state rather than on the transition, so re-running it (e.g. a
 * retried request) is harmless. The linked Availability is tagged
 * `source: "manual"` with `externalUid: "booking:<documentId>"`, never
 * touched by the iCal sync (`syncProperty` only reconciles `source: "airbnb"`
 * records), so the two feeds can't collide.
 *
 * Only reacts when `bookingStatus` is part of this update — other edits
 * (guest message, phone number...) must not re-run this. Errors are logged
 * and swallowed: the admin's save already committed by the time `afterUpdate`
 * runs, so throwing here couldn't roll it back anyway, only surface a
 * confusing 500 for an otherwise-successful edit.
 */
export async function reconcileAvailabilityForBooking(
  event: AfterUpdateEvent,
  { strapi }: { strapi: Core.Strapi },
): Promise<void> {
  if (typeof event.params.data.bookingStatus !== "string") return;

  try {
    const booking = await strapi.documents("api::booking-request.booking-request").findOne({
      documentId: event.result.documentId,
      populate: ["property"],
    });
    if (!booking) return;

    const property = booking.property as { documentId: string } | null;
    if (!property) return;
    if (!booking.startDate || !booking.endDate) return;

    const availabilities = strapi.documents("api::availability.availability");
    const externalUid = bookingAvailabilityUid(booking.documentId);
    const existing = await availabilities.findFirst({
      filters: { externalUid, source: AVAILABILITY_SOURCE },
    });

    if (booking.bookingStatus === "accepted") {
      const data = {
        property: property.documentId,
        source: AVAILABILITY_SOURCE,
        externalUid,
        startDate: booking.startDate,
        endDate: booking.endDate,
        summary: `Réservation acceptée — ${booking.guestName}`,
      };
      if (existing) {
        await availabilities.update({ documentId: existing.documentId, data });
      } else {
        await availabilities.create({ data });
      }
    } else if (existing) {
      await availabilities.delete({ documentId: existing.documentId });
    }
  } catch (error) {
    strapi.log.error(
      `Failed to reconcile availability for booking-request ${event.result.documentId}: ${(error as Error).message}`,
    );
  }
}

export default {
  async afterCreate(event: CreateEvent) {
    await notifyOwnerOnCreate(event, { strapi });
  },
  async beforeUpdate(event: UpdateEvent) {
    await stampStatusChangeOnUpdate(event, { strapi });
  },
  async afterUpdate(event: AfterUpdateEvent) {
    await reconcileAvailabilityForBooking(event, { strapi });
  },
};
