import { expect, test } from "@playwright/test";
import { PROPERTY_SLUG } from "./config";
import { calendarDayButtonName, futureDateRange } from "./helpers";

test("a visitor can submit a booking request from the property page", async ({ page }) => {
  await page.goto(`/en/properties/${PROPERTY_SLUG}`);

  // Deliberately short span (10 days + 3 nights): the calendar only shows
  // the current month and the next one without navigation, so the range
  // must fit regardless of the day of month at run time.
  const { start, end } = futureDateRange(10, 3);
  await page
    .getByRole("button", { name: calendarDayButtonName(new Date(`${start}T00:00:00Z`), "en") })
    .click();
  await page
    .getByRole("button", { name: calendarDayButtonName(new Date(`${end}T00:00:00Z`), "en") })
    .click();
  await page.locator("#guestName").fill("Alex Traveler");
  await page.locator("#guestEmail").fill("alex.traveler@example.com");

  await page.getByRole("button", { name: "Send request" }).click();

  await expect(
    page.getByText("Your request has been sent. The owner will get back to you shortly."),
  ).toBeVisible();
});

test("the name and email are required before submitting (native form validation)", async ({
  page,
}) => {
  await page.goto(`/en/properties/${PROPERTY_SLUG}`);

  const { start, end } = futureDateRange(20, 2);
  await page
    .getByRole("button", { name: calendarDayButtonName(new Date(`${start}T00:00:00Z`), "en") })
    .click();
  await page
    .getByRole("button", { name: calendarDayButtonName(new Date(`${end}T00:00:00Z`), "en") })
    .click();

  await page.getByRole("button", { name: "Send request" }).click();

  // Empty fields + `required`: the browser blocks submission before it
  // reaches the Server Action, so there's no server round-trip here.
  await expect(page.locator("#guestName")).toHaveJSProperty("validity.valid", false);
  await expect(
    page.getByText("Your request has been sent. The owner will get back to you shortly."),
  ).not.toBeVisible();
});
