import type { Core } from "@strapi/strapi";

interface UpdateEvent {
  params: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  };
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

export default {
  async beforeUpdate(event: UpdateEvent) {
    await stampStatusChangeOnUpdate(event, { strapi });
  },
};
