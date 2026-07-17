import type { Core } from "@strapi/strapi";

interface UpdateEvent {
  params: {
    where: Record<string, unknown>;
    data: Record<string, unknown>;
  };
}

/**
 * Stamps `statusChangedAt` whenever `status` actually changes, so the owner's
 * accept/refuse decision stays traceable (issue #9 acceptance criteria)
 * without relying on `updatedAt`, which also changes on unrelated edits.
 */
export async function stampStatusChangeOnUpdate(
  event: UpdateEvent,
  { strapi }: { strapi: Core.Strapi },
): Promise<void> {
  const { data, where } = event.params;
  if (typeof data.status !== "string") return;

  const existing = await strapi.db
    .query("api::booking-request.booking-request")
    .findOne({ where, select: ["status"] });

  if (existing && existing.status !== data.status) {
    data.statusChangedAt = new Date();
  }
}

export default {
  async beforeUpdate(event: UpdateEvent) {
    await stampStatusChangeOnUpdate(event, { strapi });
  },
};
