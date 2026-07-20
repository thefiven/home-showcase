import { describe, expect, it, vi } from "vitest";
import {
  stampStatusChangeOnUpdate,
  notifyOwnerOnCreate,
  reconcileAvailabilityForBooking,
} from "./lifecycles";

function buildStrapi(existingStatus: string | null) {
  const findOne = vi.fn(() =>
    Promise.resolve(existingStatus === null ? null : { bookingStatus: existingStatus }),
  );
  return { db: { query: vi.fn(() => ({ findOne })) }, findOne };
}

describe("stampStatusChangeOnUpdate", () => {
  it("stamps statusChangedAt when the status changes", async () => {
    const { db, findOne } = buildStrapi("pending");
    const event = { params: { where: { id: 1 }, data: { bookingStatus: "accepted" } } };

    await stampStatusChangeOnUpdate(event, { strapi: { db } as never });

    expect(findOne).toHaveBeenCalledWith({ where: { id: 1 }, select: ["bookingStatus"] });
    expect(event.params.data.statusChangedAt).toBeInstanceOf(Date);
  });

  it("stamps nothing if the status does not change", async () => {
    const { db } = buildStrapi("pending");
    const event = { params: { where: { id: 1 }, data: { bookingStatus: "pending" } } };

    await stampStatusChangeOnUpdate(event, { strapi: { db } as never });

    expect(event.params.data).not.toHaveProperty("statusChangedAt");
  });

  it("stamps nothing if the update does not touch the status", async () => {
    const { db, findOne } = buildStrapi("pending");
    const event = { params: { where: { id: 1 }, data: { guestName: "Alex" } } };

    await stampStatusChangeOnUpdate(event, { strapi: { db } as never });

    expect(findOne).not.toHaveBeenCalled();
    expect(event.params.data).not.toHaveProperty("statusChangedAt");
  });
});

describe("notifyOwnerOnCreate", () => {
  it("triggers the email notification for the created request", async () => {
    const send = vi.fn(() => Promise.resolve());
    const findOne = vi.fn(() => Promise.resolve({ property: { name: "Villa des Pins" } }));
    const strapi = {
      documents: vi.fn(() => ({ findOne })),
      plugin: vi.fn(() => ({ service: vi.fn(() => ({ send })) })),
      log: { error: vi.fn(), warn: vi.fn() },
    };
    process.env.OWNER_NOTIFICATION_EMAIL = "owner@example.com";

    const event = {
      result: {
        documentId: "abc123",
        startDate: "2026-08-01",
        endDate: "2026-08-08",
        guestName: "Alex Martin",
        guestEmail: "alex@example.com",
      },
    };

    await expect(notifyOwnerOnCreate(event, { strapi: strapi as never })).resolves.toBeUndefined();
    expect(send).toHaveBeenCalledWith(expect.objectContaining({ to: "owner@example.com" }));

    delete process.env.OWNER_NOTIFICATION_EMAIL;
  });
});

describe("reconcileAvailabilityForBooking", () => {
  const booking = {
    documentId: "booking-1",
    bookingStatus: "accepted",
    startDate: "2026-08-01",
    endDate: "2026-08-08",
    guestName: "Alex Martin",
    property: { documentId: "property-1" },
  };

  function buildStrapi({
    bookingOverrides = {},
    existingAvailability = null as { documentId: string } | null,
  } = {}) {
    const findOneBooking = vi.fn(() => Promise.resolve({ ...booking, ...bookingOverrides }));
    const findFirst = vi.fn(() => Promise.resolve(existingAvailability));
    const create = vi.fn(() => Promise.resolve({}));
    const update = vi.fn(() => Promise.resolve({}));
    const del = vi.fn(() => Promise.resolve({}));

    const documents = vi.fn((uid: string) =>
      uid === "api::booking-request.booking-request"
        ? { findOne: findOneBooking }
        : { findFirst, create, update, delete: del },
    );

    const strapi = { documents, log: { error: vi.fn() } };
    return { strapi, findOneBooking, findFirst, create, update, delete: del };
  }

  it("ignores updates that do not touch bookingStatus", async () => {
    const { strapi, findOneBooking } = buildStrapi();
    const event = { result: { documentId: "booking-1" }, params: { data: { message: "hi" } } };

    await reconcileAvailabilityForBooking(event, { strapi: strapi as never });

    expect(findOneBooking).not.toHaveBeenCalled();
  });

  it("creates an Availability when the request moves to accepted", async () => {
    const { strapi, create, findFirst } = buildStrapi();
    const event = {
      result: { documentId: "booking-1" },
      params: { data: { bookingStatus: "accepted" } },
    };

    await reconcileAvailabilityForBooking(event, { strapi: strapi as never });

    expect(findFirst).toHaveBeenCalledWith({
      filters: { externalUid: "booking:booking-1", source: "manual" },
    });
    expect(create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        property: "property-1",
        source: "manual",
        externalUid: "booking:booking-1",
        startDate: "2026-08-01",
        endDate: "2026-08-08",
      }),
    });
  });

  it("updates the existing Availability rather than recreating one", async () => {
    const { strapi, create, update } = buildStrapi({
      existingAvailability: { documentId: "availability-1" },
    });
    const event = {
      result: { documentId: "booking-1" },
      params: { data: { bookingStatus: "accepted" } },
    };

    await reconcileAvailabilityForBooking(event, { strapi: strapi as never });

    expect(update).toHaveBeenCalledWith({
      documentId: "availability-1",
      data: expect.objectContaining({ startDate: "2026-08-01", endDate: "2026-08-08" }),
    });
    expect(create).not.toHaveBeenCalled();
  });

  it("deletes the Availability when the request moves back to refused", async () => {
    const {
      strapi,
      delete: del,
      create,
    } = buildStrapi({
      bookingOverrides: { bookingStatus: "refused" },
      existingAvailability: { documentId: "availability-1" },
    });
    const event = {
      result: { documentId: "booking-1" },
      params: { data: { bookingStatus: "refused" } },
    };

    await reconcileAvailabilityForBooking(event, { strapi: strapi as never });

    expect(del).toHaveBeenCalledWith({ documentId: "availability-1" });
    expect(create).not.toHaveBeenCalled();
  });

  it("does nothing if the request moves back to pending without an existing Availability", async () => {
    const {
      strapi,
      delete: del,
      create,
      update,
    } = buildStrapi({
      bookingOverrides: { bookingStatus: "pending" },
    });
    const event = {
      result: { documentId: "booking-1" },
      params: { data: { bookingStatus: "pending" } },
    };

    await reconcileAvailabilityForBooking(event, { strapi: strapi as never });

    expect(del).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("logs and swallows Document Service errors", async () => {
    const { strapi, findFirst } = buildStrapi();
    findFirst.mockRejectedValueOnce(new Error("db down"));
    const event = {
      result: { documentId: "booking-1" },
      params: { data: { bookingStatus: "accepted" } },
    };

    await expect(
      reconcileAvailabilityForBooking(event, { strapi: strapi as never }),
    ).resolves.toBeUndefined();
    expect(strapi.log.error).toHaveBeenCalledWith(expect.stringContaining("booking-1"));
  });
});
