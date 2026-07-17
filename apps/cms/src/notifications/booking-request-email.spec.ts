import { describe, expect, it } from "vitest";
import { buildBookingRequestEmail, type BookingRequestEmailData } from "./booking-request-email";

const baseBooking: BookingRequestEmailData = {
  documentId: "abc123",
  propertyName: "Villa des Pins",
  startDate: "2026-08-01",
  endDate: "2026-08-08",
  guestName: "Alex Martin",
  guestEmail: "alex@example.com",
};

describe("buildBookingRequestEmail", () => {
  it("inclut le logement, les dates et le contact du demandeur", () => {
    const email = buildBookingRequestEmail(baseBooking, {
      adminUrl: "http://localhost:1337/admin",
    });

    expect(email.subject).toContain("Villa des Pins");
    expect(email.text).toContain("Villa des Pins");
    expect(email.text).toContain("2026-08-01");
    expect(email.text).toContain("2026-08-08");
    expect(email.text).toContain("Alex Martin");
    expect(email.text).toContain("alex@example.com");
  });

  it("construit le lien admin à partir de adminUrl et du documentId", () => {
    const email = buildBookingRequestEmail(baseBooking, {
      adminUrl: "http://localhost:1337/admin/",
    });

    expect(email.text).toContain(
      "http://localhost:1337/admin/content-manager/collection-types/api::booking-request.booking-request/abc123",
    );
    expect(email.html).toContain("abc123");
  });

  it("omet les champs optionnels absents (téléphone, voyageurs, message)", () => {
    const email = buildBookingRequestEmail(baseBooking, {
      adminUrl: "http://localhost:1337/admin",
    });

    expect(email.text).not.toContain("Téléphone");
    expect(email.text).not.toContain("Nombre de voyageurs");
    expect(email.text).not.toContain("Message");
  });

  it("inclut les champs optionnels quand fournis", () => {
    const email = buildBookingRequestEmail(
      { ...baseBooking, guestPhone: "0600000000", numberOfGuests: 4, message: "Arrivée tardive" },
      { adminUrl: "http://localhost:1337/admin" },
    );

    expect(email.text).toContain("0600000000");
    expect(email.text).toContain("Nombre de voyageurs : 4");
    expect(email.text).toContain("Arrivée tardive");
  });
});
