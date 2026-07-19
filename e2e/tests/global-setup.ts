import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import { ADMIN_EMAIL, ADMIN_PASSWORD, PROPERTY_NAME, PROPERTY_SLUG, STRAPI_URL } from "./config";

const AUTH_DIR = path.join(__dirname, ".auth");
export const ADMIN_STORAGE_STATE_PATH = path.join(AUTH_DIR, "admin.json");

/**
 * Registers the first Strapi admin over HTTP (only works once, while
 * `hasAdmin` is false — safe here since the E2E DB is dropped before every
 * run, see e2e/run.sh).
 */
async function registerAdminIfNeeded(): Promise<void> {
  const initRes = await fetch(`${STRAPI_URL}/admin/init`);
  const { data } = (await initRes.json()) as { data: { hasAdmin: boolean } };
  if (data.hasAdmin) return;

  const registerRes = await fetch(`${STRAPI_URL}/admin/register-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      firstname: "E2E",
      lastname: "Admin",
    }),
  });
  if (!registerRes.ok) {
    throw new Error(`Échec de la création de l'admin e2e : ${await registerRes.text()}`);
  }
}

/** Exported for use by test helpers that need to seed data via the admin API (see helpers.ts). */
export async function adminLogin(): Promise<string> {
  const res = await fetch(`${STRAPI_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  if (!res.ok) {
    throw new Error(`Échec de la connexion admin e2e : ${await res.text()}`);
  }
  const { data } = (await res.json()) as { data: { token: string } };
  return data.token;
}

interface PropertyDocument {
  documentId: string;
  slug: string;
}

/**
 * Creates and publishes the fixture Property used by every E2E test, in
 * both locales. Idempotent: if a property with the same slug already exists
 * (re-run against a stack that wasn't torn down), it's reused as-is.
 */
async function ensureProperty(token: string): Promise<PropertyDocument> {
  const existingRes = await fetch(
    `${STRAPI_URL}/api/properties?filters[slug][$eq]=${PROPERTY_SLUG}&locale=fr`,
  );
  const existing = (await existingRes.json()) as { data: Array<{ documentId: string }> };
  if (existing.data.length > 0) {
    return { documentId: existing.data[0].documentId, slug: PROPERTY_SLUG };
  }

  const createRes = await fetch(
    `${STRAPI_URL}/content-manager/collection-types/api::property.property?locale=fr`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        name: PROPERTY_NAME,
        slug: PROPERTY_SLUG,
        location: { city: "Nice", country: "France" },
        pricing: { basePricePerNight: 120, currency: "EUR" },
      }),
    },
  );
  if (!createRes.ok) {
    throw new Error(`Échec de la création du logement e2e : ${await createRes.text()}`);
  }
  const created = (await createRes.json()) as { data: PropertyDocument };

  const publishRes = await fetch(
    `${STRAPI_URL}/content-manager/collection-types/api::property.property/${created.data.documentId}/actions/publish?locale=fr`,
    { method: "POST", headers: { Authorization: `Bearer ${token}` } },
  );
  if (!publishRes.ok) {
    throw new Error(`Échec de la publication du logement e2e : ${await publishRes.text()}`);
  }

  return { documentId: created.data.documentId, slug: created.data.slug };
}

/**
 * Saves a Playwright storageState for the admin session (captured via a real
 * UI login) so `admin-booking-status.spec.ts` doesn't need to log in again
 * for every test.
 */
async function saveAdminStorageState(): Promise<void> {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${STRAPI_URL}/admin/auth/login`);
  await page.fill('input[name="email"]', ADMIN_EMAIL);
  await page.fill('input[name="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  // Not "**/admin**": that pattern also matches the login page itself
  // (/admin/auth/login), so it would resolve before the login POST
  // completes and capture a signed-out storageState.
  await page.waitForURL((url) => !url.pathname.includes("/auth/"), { timeout: 15_000 });
  await page.waitForLoadState("networkidle");

  fs.mkdirSync(AUTH_DIR, { recursive: true });
  await page.context().storageState({ path: ADMIN_STORAGE_STATE_PATH });
  await browser.close();
}

export default async function globalSetup(): Promise<void> {
  await registerAdminIfNeeded();
  const token = await adminLogin();
  await ensureProperty(token);
  await saveAdminStorageState();
}
