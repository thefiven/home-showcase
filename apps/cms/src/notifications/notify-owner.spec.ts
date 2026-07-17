import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { notifyOwnerOfBookingRequest, type BookingRequestResult } from "./notify-owner";

const booking: BookingRequestResult = {
  documentId: "abc123",
  startDate: "2026-08-01",
  endDate: "2026-08-08",
  guestName: "Alex Martin",
  guestEmail: "alex@example.com",
};

function buildStrapi({
  property,
  send,
}: {
  property?: { name: string } | null;
  send: ReturnType<typeof vi.fn>;
}) {
  const findOne = vi.fn(() =>
    Promise.resolve({ property: property ?? { name: "Villa des Pins" } }),
  );
  const log = { error: vi.fn(), warn: vi.fn() };
  return {
    strapi: {
      documents: vi.fn(() => ({ findOne })),
      plugin: vi.fn(() => ({ service: vi.fn(() => ({ send })) })),
      log,
    } as never,
    findOne,
    log,
  };
}

describe("notifyOwnerOfBookingRequest", () => {
  const originalOwnerEmail = process.env.OWNER_NOTIFICATION_EMAIL;
  const originalAdminUrl = process.env.ADMIN_URL;

  beforeEach(() => {
    process.env.OWNER_NOTIFICATION_EMAIL = "owner@example.com";
    delete process.env.ADMIN_URL;
  });

  afterEach(() => {
    process.env.OWNER_NOTIFICATION_EMAIL = originalOwnerEmail;
    process.env.ADMIN_URL = originalAdminUrl;
  });

  it("envoie l'email à la propriétaire quand OWNER_NOTIFICATION_EMAIL est configuré", async () => {
    const send = vi.fn(() => Promise.resolve());
    const { strapi } = buildStrapi({ send });

    await notifyOwnerOfBookingRequest(strapi, booking);

    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "owner@example.com",
        subject: expect.stringContaining("Villa des Pins"),
      }),
    );
  });

  it("logue l'erreur et ne throw pas si l'envoi échoue", async () => {
    const send = vi.fn(() => Promise.reject(new Error("SMTP connection refused")));
    const { strapi, log } = buildStrapi({ send });

    await expect(notifyOwnerOfBookingRequest(strapi, booking)).resolves.toBeUndefined();
    expect(log.error).toHaveBeenCalledWith(expect.stringContaining("SMTP connection refused"));
  });

  it("ne fait rien et logue un warning si OWNER_NOTIFICATION_EMAIL est absent", async () => {
    delete process.env.OWNER_NOTIFICATION_EMAIL;
    const send = vi.fn(() => Promise.resolve());
    const { strapi, log } = buildStrapi({ send });

    await notifyOwnerOfBookingRequest(strapi, booking);

    expect(send).not.toHaveBeenCalled();
    expect(log.warn).toHaveBeenCalled();
  });
});
