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

/**
 * Admin panel role for the property owner (SPEC.md §1, issue #8): edits content
 * without touching technical configuration (content-type builder, users, plugins…).
 */
export const OWNER_ROLE = {
  name: "Propriétaire",
  code: "proprietaire",
  description:
    "Édite les fiches logement et gère les demandes de réservation, sans accès à la configuration technique de l'admin.",
};

/**
 * Content-manager actions granted per content type. Property gets full lifecycle
 * including publish (draftAndPublish is on). BookingRequest is read/update only —
 * the owner reviews and accepts/refuses requests but doesn't create or delete them.
 */
export const OWNER_CONTENT_TYPE_ACTIONS: Record<string, string[]> = {
  "api::property.property": [
    "plugin::content-manager.explorer.create",
    "plugin::content-manager.explorer.read",
    "plugin::content-manager.explorer.update",
    "plugin::content-manager.explorer.publish",
  ],
  "api::booking-request.booking-request": [
    "plugin::content-manager.explorer.read",
    "plugin::content-manager.explorer.update",
  ],
};

/** Media library access needed to upload/replace property photos from the admin. */
export const OWNER_MEDIA_LIBRARY_ACTIONS = [
  "plugin::upload.read",
  "plugin::upload.assets.create",
  "plugin::upload.assets.update",
];

type AdminAction = { actionId: string; section: string; subjects: string[] };

export async function ensureOwnerRole({ strapi }: { strapi: Core.Strapi }) {
  const roleService = strapi.service("admin::role");
  const contentTypeService = strapi.service("admin::content-type");
  const { actionProvider } = strapi.service("admin::permission");

  let ownerRole = await strapi.db
    .query("admin::role")
    .findOne({ where: { code: OWNER_ROLE.code } });
  if (!ownerRole) {
    ownerRole = await roleService.create(OWNER_ROLE);
  }

  const contentTypeActions = (actionProvider.values() as AdminAction[]).filter(
    (action) => action.section === "contentTypes",
  );

  const scopedActions = Object.entries(OWNER_CONTENT_TYPE_ACTIONS).flatMap(([subject, actionIds]) =>
    contentTypeActions
      .filter((action) => actionIds.includes(action.actionId) && action.subjects.includes(subject))
      .map((action) => ({ ...action, subjects: [subject] })),
  );

  const permissions = [
    ...contentTypeService.getPermissionsWithNestedFields(scopedActions),
    ...OWNER_MEDIA_LIBRARY_ACTIONS.map((action) => ({ action })),
  ];

  await roleService.assignPermissions(ownerRole.id, permissions);
}
