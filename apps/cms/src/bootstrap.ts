import type { Core } from "@strapi/strapi";

/**
 * Locales that must exist for the bilingual FR/EN showcase content
 * (SPEC.md §2). `fr` is the reference locale for the owner-facing content.
 */
export const REQUIRED_LOCALES = [
  { code: "fr", name: "Français (fr)" },
  { code: "en", name: "English (en)" },
];
export const DEFAULT_LOCALE_CODE = "fr";

/**
 * Content-type actions exposed to the public (unauthenticated) API role.
 * BookingRequest stays private: read access isn't needed by visitors, and
 * public `create` will be opened by the booking-request-form feature.
 */
export const PUBLIC_READ_ACTIONS = [
  "api::property.property.find",
  "api::property.property.findOne",
  "api::availability.availability.find",
  "api::availability.availability.findOne",
];

export async function ensureLocales({ strapi }: { strapi: Core.Strapi }) {
  const localesService = strapi.plugin("i18n").service("locales");

  for (const locale of REQUIRED_LOCALES) {
    const existing = await localesService.findByCode(locale.code);
    if (!existing) {
      await localesService.create(locale);
    }
  }

  await localesService.setDefaultLocale({ code: DEFAULT_LOCALE_CODE });
}

export async function ensurePublicReadPermissions({ strapi }: { strapi: Core.Strapi }) {
  const publicRole = await strapi.db
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "public" } });

  if (!publicRole) {
    strapi.log.warn("Public role not found — skipping public permissions bootstrap.");
    return;
  }

  for (const action of PUBLIC_READ_ACTIONS) {
    const existing = await strapi.db
      .query("plugin::users-permissions.permission")
      .findOne({ where: { action, role: publicRole.id } });

    if (!existing) {
      await strapi.db
        .query("plugin::users-permissions.permission")
        .create({ data: { action, role: publicRole.id } });
    }
  }
}
