import { describe, expect, it, vi } from "vitest";
import { stampStatusChangeOnUpdate } from "./lifecycles";

function buildStrapi(existingStatus: string | null) {
  const findOne = vi.fn(() =>
    Promise.resolve(existingStatus === null ? null : { bookingStatus: existingStatus }),
  );
  return { db: { query: vi.fn(() => ({ findOne })) }, findOne };
}

describe("stampStatusChangeOnUpdate", () => {
  it("stamp statusChangedAt quand le statut change", async () => {
    const { db, findOne } = buildStrapi("pending");
    const event = { params: { where: { id: 1 }, data: { bookingStatus: "accepted" } } };

    await stampStatusChangeOnUpdate(event, { strapi: { db } as never });

    expect(findOne).toHaveBeenCalledWith({ where: { id: 1 }, select: ["bookingStatus"] });
    expect(event.params.data.statusChangedAt).toBeInstanceOf(Date);
  });

  it("ne stamp rien si le statut ne change pas", async () => {
    const { db } = buildStrapi("pending");
    const event = { params: { where: { id: 1 }, data: { bookingStatus: "pending" } } };

    await stampStatusChangeOnUpdate(event, { strapi: { db } as never });

    expect(event.params.data).not.toHaveProperty("statusChangedAt");
  });

  it("ne stamp rien si la mise à jour ne touche pas le statut", async () => {
    const { db, findOne } = buildStrapi("pending");
    const event = { params: { where: { id: 1 }, data: { guestName: "Alex" } } };

    await stampStatusChangeOnUpdate(event, { strapi: { db } as never });

    expect(findOne).not.toHaveBeenCalled();
    expect(event.params.data).not.toHaveProperty("statusChangedAt");
  });
});
