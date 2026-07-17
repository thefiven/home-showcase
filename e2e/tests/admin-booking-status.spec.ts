import { expect, test } from "@playwright/test";
import { PROPERTY_SLUG, STRAPI_URL } from "./config";
import { ADMIN_STORAGE_STATE_PATH } from "./global-setup";
import { createBookingRequest, getPropertyDocumentId } from "./helpers";

test.use({ storageState: ADMIN_STORAGE_STATE_PATH });

async function setBookingStatus(
  page: import("@playwright/test").Page,
  documentId: string,
  status: "accepted" | "refused",
) {
  await page.goto(
    `${STRAPI_URL}/admin/content-manager/collection-types/api::booking-request.booking-request/${documentId}`,
  );
  await page.getByRole("combobox", { name: /bookingStatus/i }).click();
  await page.getByRole("option", { name: status, exact: true }).click();
  await page.getByRole("button", { name: /save/i }).click();
  await expect(page.getByText(/saved document/i)).toBeVisible();
}

test.describe("accept/refuse une demande de réservation depuis l'admin", () => {
  let propertyDocumentId: string;

  test.beforeAll(async () => {
    propertyDocumentId = await getPropertyDocumentId(PROPERTY_SLUG);
  });

  test("la propriétaire peut accepter une demande", async ({ page }) => {
    const { documentId } = await createBookingRequest(propertyDocumentId, {
      guestEmail: "accept-flow@example.com",
    });

    await setBookingStatus(page, documentId, "accepted");

    await expect(
      page.getByRole("combobox", { name: /bookingStatus/i }).getByText("accepted"),
    ).toBeVisible();
  });

  test("la propriétaire peut refuser une demande", async ({ page }) => {
    const { documentId } = await createBookingRequest(propertyDocumentId, {
      guestEmail: "refuse-flow@example.com",
    });

    await setBookingStatus(page, documentId, "refused");

    await expect(
      page.getByRole("combobox", { name: /bookingStatus/i }).getByText("refused"),
    ).toBeVisible();
  });
});
