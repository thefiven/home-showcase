import { expect, test } from "@playwright/test";
import { PROPERTY_SLUG } from "./config";
import { calendarDayButtonName, futureDateRange } from "./helpers";

test("un visiteur peut soumettre une demande de réservation depuis la fiche logement", async ({
  page,
}) => {
  await page.goto(`/en/properties/${PROPERTY_SLUG}`);

  // Écart volontairement court (10 jours + 3 nuits) : le calendrier n'affiche
  // que le mois courant et le suivant sans navigation, la plage doit donc y
  // tenir quel que soit le jour du mois au moment du run.
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
