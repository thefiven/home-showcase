import { expect, test } from "@playwright/test";
import { PROPERTY_SLUG, STRAPI_URL } from "./config";
import { ADMIN_STORAGE_STATE_PATH } from "./global-setup";
import { createBookingRequest, futureDateRange, getPropertyDocumentId } from "./helpers";

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

test.describe("accept/refuse a booking request from the admin", () => {
  let propertyDocumentId: string;

  test.beforeAll(async () => {
    propertyDocumentId = await getPropertyDocumentId(PROPERTY_SLUG);
  });

  test("the owner can accept a request", async ({ page }) => {
    const { documentId } = await createBookingRequest(propertyDocumentId, {
      guestEmail: "accept-flow@example.com",
    });

    await setBookingStatus(page, documentId, "accepted");

    await expect(
      page.getByRole("combobox", { name: /bookingStatus/i }).getByText("accepted"),
    ).toBeVisible();
  });

  test("the owner can refuse a request", async ({ page }) => {
    // Range distinct from the "accept" test above: accepting a request
    // there now blocks its dates (issue #79), so reusing the default
    // range would cause this creation to be rejected as overlapping.
    const { start, end } = futureDateRange(80, 4);
    const { documentId } = await createBookingRequest(propertyDocumentId, {
      startDate: start,
      endDate: end,
      guestEmail: "refuse-flow@example.com",
    });

    await setBookingStatus(page, documentId, "refused");

    await expect(
      page.getByRole("combobox", { name: /bookingStatus/i }).getByText("refused"),
    ).toBeVisible();
  });
});
