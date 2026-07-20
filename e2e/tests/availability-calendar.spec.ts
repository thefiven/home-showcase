import { expect, test } from "@playwright/test";
import { PROPERTY_SLUG, STRAPI_URL } from "./config";
import { createAvailability, formatDate, futureDateRange, getPropertyDocumentId } from "./helpers";

let propertyDocumentId: string;

test.beforeAll(async () => {
  propertyDocumentId = await getPropertyDocumentId(PROPERTY_SLUG);
});

test("a date blocked by the availability sync is shown as unavailable", async ({ page }) => {
  const { start } = futureDateRange(15, 0);
  await createAvailability(propertyDocumentId, start, start);

  await page.goto(`/en/properties/${PROPERTY_SLUG}`);

  const formattedDate = new Intl.DateTimeFormat("en", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(new Date(`${start}T00:00:00Z`));

  await expect(page.getByLabel(`Unavailable on ${formattedDate}`)).toBeVisible();
  await expect(
    page.getByRole("button", { name: `Available on ${formattedDate}` }),
  ).not.toBeVisible();
});

test("the server rejects a booking request that overlaps a blocked range", async () => {
  const { start: blockStart } = futureDateRange(100, 0);
  const blockEndDate = new Date(`${blockStart}T00:00:00Z`);
  blockEndDate.setUTCDate(blockEndDate.getUTCDate() + 2);
  await createAvailability(propertyDocumentId, blockStart, formatDate(blockEndDate));

  // Partially overlaps the blocked range (middle day -> day after the block).
  const overlappingStart = new Date(`${blockStart}T00:00:00Z`);
  overlappingStart.setUTCDate(overlappingStart.getUTCDate() + 1);
  const overlappingEnd = new Date(overlappingStart);
  overlappingEnd.setUTCDate(overlappingEnd.getUTCDate() + 1);

  const res = await fetch(`${STRAPI_URL}/api/booking-requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: {
        property: propertyDocumentId,
        startDate: formatDate(overlappingStart),
        endDate: formatDate(overlappingEnd),
        guestName: "Overlap Attempt",
        guestEmail: "overlap-attempt@example.com",
      },
    }),
  });

  expect(res.status).toBe(400);
  const body = (await res.json()) as { error: { message: string } };
  expect(body.error.message).toMatch(/indisponible/i);
});
