import { expect, test } from "@playwright/test";
import { PROPERTY_SLUG } from "./config";
import { futureDateRange } from "./helpers";

test("un visiteur peut soumettre une demande de réservation depuis la fiche logement", async ({
  page,
}) => {
  await page.goto(`/en/properties/${PROPERTY_SLUG}`);

  const { start, end } = futureDateRange(30, 5);
  await page.locator("#startDate").fill(start);
  await page.locator("#endDate").fill(end);
  await page.locator("#guestName").fill("Alex Traveler");
  await page.locator("#guestEmail").fill("alex.traveler@example.com");

  await page.getByRole("button", { name: "Send request" }).click();

  await expect(
    page.getByText("Your request has been sent. The owner will get back to you shortly."),
  ).toBeVisible();
});
