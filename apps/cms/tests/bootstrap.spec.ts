import { describe, expect, it, vi } from "vitest";
import {
  DEFAULT_LOCALE_CODE,
  ensureLocales,
  ensureOwnerRole,
  ensurePublicPermissions,
  OWNER_CONTENT_TYPE_ACTIONS,
  OWNER_MEDIA_LIBRARY_ACTIONS,
  OWNER_ROLE,
  PUBLIC_READ_ACTIONS,
  PUBLIC_WRITE_ACTIONS,
  REQUIRED_LOCALES,
} from "../src/bootstrap";

function buildLocalesServiceMock(existingCodes: string[] = []) {
  return {
    findByCode: vi.fn((code: string) =>
      Promise.resolve(existingCodes.includes(code) ? { code } : null),
    ),
    create: vi.fn(() => Promise.resolve({})),
    setDefaultLocale: vi.fn(() => Promise.resolve()),
  };
}

function buildStrapiWithLocalesService(localesService: ReturnType<typeof buildLocalesServiceMock>) {
  return {
    plugin: vi.fn(() => ({ service: vi.fn(() => localesService) })),
  };
}

describe("ensureLocales", () => {
  it("crée fr et en quand aucune locale n’existe, puis fixe fr par défaut", async () => {
    const localesService = buildLocalesServiceMock([]);
    const strapi = buildStrapiWithLocalesService(localesService);

    await ensureLocales({ strapi: strapi as never });

    expect(localesService.create).toHaveBeenCalledTimes(REQUIRED_LOCALES.length);
    for (const locale of REQUIRED_LOCALES) {
      expect(localesService.create).toHaveBeenCalledWith(locale);
    }
    expect(localesService.setDefaultLocale).toHaveBeenCalledWith({ code: DEFAULT_LOCALE_CODE });
  });

  it("ne recrée pas les locales déjà présentes (idempotent)", async () => {
    const localesService = buildLocalesServiceMock(["fr", "en"]);
    const strapi = buildStrapiWithLocalesService(localesService);

    await ensureLocales({ strapi: strapi as never });

    expect(localesService.create).not.toHaveBeenCalled();
    expect(localesService.setDefaultLocale).toHaveBeenCalledWith({ code: DEFAULT_LOCALE_CODE });
  });

  it("recrée uniquement la locale manquante", async () => {
    const localesService = buildLocalesServiceMock(["fr"]);
    const strapi = buildStrapiWithLocalesService(localesService);

    await ensureLocales({ strapi: strapi as never });

    expect(localesService.create).toHaveBeenCalledTimes(1);
    expect(localesService.create).toHaveBeenCalledWith({ code: "en", name: "English (en)" });
  });
});

const PUBLIC_ROLE = { id: 7, type: "public" };

function buildDbMock({
  publicRole = PUBLIC_ROLE as typeof PUBLIC_ROLE | null,
  existingActions = [] as string[],
} = {}) {
  const permissionFindOne = vi.fn(({ where }: { where: { action: string; role: number } }) =>
    Promise.resolve(existingActions.includes(where.action) ? { id: 1, ...where } : null),
  );
  const permissionCreate = vi.fn(() => Promise.resolve({}));
  const roleFindOne = vi.fn(() => Promise.resolve(publicRole));

  const query = vi.fn((uid: string) => {
    if (uid === "plugin::users-permissions.role") {
      return { findOne: roleFindOne };
    }
    if (uid === "plugin::users-permissions.permission") {
      return { findOne: permissionFindOne, create: permissionCreate };
    }
    throw new Error(`Unexpected query uid in test: ${uid}`);
  });

  return { query, roleFindOne, permissionFindOne, permissionCreate };
}

describe("ensurePublicPermissions", () => {
  it("accorde find/findOne sur Property et Availability au rôle public", async () => {
    const db = buildDbMock();
    const strapi = { db, log: { warn: vi.fn() } };

    await ensurePublicPermissions({ strapi: strapi as never });

    for (const action of PUBLIC_READ_ACTIONS) {
      expect(db.permissionCreate).toHaveBeenCalledWith({ data: { action, role: PUBLIC_ROLE.id } });
    }
  });

  it("n’accorde jamais de lecture publique sur BookingRequest, mais accorde sa création", async () => {
    const db = buildDbMock();
    const strapi = { db, log: { warn: vi.fn() } };

    await ensurePublicPermissions({ strapi: strapi as never });

    const grantedActions = db.permissionCreate.mock.calls.map(([{ data }]) => data.action);
    expect(
      grantedActions.some(
        (action) =>
          action.includes("booking-request") &&
          (action.endsWith(".find") || action.endsWith(".findOne")),
      ),
    ).toBe(false);
    for (const action of PUBLIC_WRITE_ACTIONS) {
      expect(grantedActions).toContain(action);
    }
  });

  it("ne recrée pas les permissions déjà accordées (idempotent)", async () => {
    const db = buildDbMock({ existingActions: [...PUBLIC_READ_ACTIONS, ...PUBLIC_WRITE_ACTIONS] });
    const strapi = { db, log: { warn: vi.fn() } };

    await ensurePublicPermissions({ strapi: strapi as never });

    expect(db.permissionCreate).not.toHaveBeenCalled();
  });

  it("n’échoue pas et journalise un avertissement si le rôle public est introuvable", async () => {
    const db = buildDbMock({ publicRole: null });
    const warn = vi.fn();
    const strapi = { db, log: { warn } };

    await expect(ensurePublicPermissions({ strapi: strapi as never })).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledOnce();
    expect(db.permissionCreate).not.toHaveBeenCalled();
  });
});

const ALL_ADMIN_ACTIONS = [
  {
    actionId: "plugin::content-manager.explorer.create",
    section: "contentTypes",
    subjects: ["api::property.property"],
  },
  {
    actionId: "plugin::content-manager.explorer.read",
    section: "contentTypes",
    subjects: ["api::property.property"],
  },
  {
    actionId: "plugin::content-manager.explorer.update",
    section: "contentTypes",
    subjects: ["api::property.property"],
  },
  {
    actionId: "plugin::content-manager.explorer.publish",
    section: "contentTypes",
    subjects: ["api::property.property"],
  },
  {
    actionId: "plugin::content-manager.explorer.delete",
    section: "contentTypes",
    subjects: ["api::property.property"],
  },
  {
    actionId: "plugin::content-manager.explorer.read",
    section: "contentTypes",
    subjects: ["api::booking-request.booking-request"],
  },
  {
    actionId: "plugin::content-manager.explorer.update",
    section: "contentTypes",
    subjects: ["api::booking-request.booking-request"],
  },
  {
    actionId: "plugin::content-manager.explorer.create",
    section: "contentTypes",
    subjects: ["api::booking-request.booking-request"],
  },
  {
    actionId: "plugin::content-manager.explorer.read",
    section: "contentTypes",
    subjects: ["api::availability.availability"],
  },
  {
    actionId: "plugin::content-manager.collection-types.configure-view",
    section: "plugins",
    subjects: [],
  },
];

function buildOwnerRoleStrapiMock({ existingRole = null as { id: number } | null } = {}) {
  const roleFindOne = vi.fn(() => Promise.resolve(existingRole));
  const roleCreate = vi.fn(() => Promise.resolve({ id: 42 }));
  const assignPermissions = vi.fn(() => Promise.resolve([]));
  const getPermissionsWithNestedFields = vi.fn(
    (actions: Array<{ actionId: string; subjects: string[] }>) =>
      actions.map((action) => ({
        action: action.actionId,
        subject: action.subjects[0],
        properties: { fields: [] },
      })),
  );

  const db = { query: vi.fn(() => ({ findOne: roleFindOne })) };
  const service = vi.fn((uid: string) => {
    if (uid === "admin::role") return { create: roleCreate, assignPermissions };
    if (uid === "admin::content-type") return { getPermissionsWithNestedFields };
    if (uid === "admin::permission") return { actionProvider: { values: () => ALL_ADMIN_ACTIONS } };
    throw new Error(`Unexpected service uid in test: ${uid}`);
  });

  return {
    db,
    service,
    roleFindOne,
    roleCreate,
    assignPermissions,
    getPermissionsWithNestedFields,
  };
}

describe("ensureOwnerRole", () => {
  it("crée le rôle propriétaire quand il n’existe pas encore", async () => {
    const mock = buildOwnerRoleStrapiMock();
    const strapi = { db: mock.db, service: mock.service };

    await ensureOwnerRole({ strapi: strapi as never });

    expect(mock.db.query).toHaveBeenCalledWith("admin::role");
    expect(mock.roleCreate).toHaveBeenCalledWith(OWNER_ROLE);
    expect(mock.assignPermissions).toHaveBeenCalledWith(42, expect.any(Array));
  });

  it("ne recrée pas le rôle propriétaire déjà existant (idempotent)", async () => {
    const mock = buildOwnerRoleStrapiMock({ existingRole: { id: 7 } });
    const strapi = { db: mock.db, service: mock.service };

    await ensureOwnerRole({ strapi: strapi as never });

    expect(mock.roleCreate).not.toHaveBeenCalled();
    expect(mock.assignPermissions).toHaveBeenCalledWith(7, expect.any(Array));
  });

  it("limite les actions content-manager à Property et BookingRequest, sans delete ni create sur BookingRequest", async () => {
    const mock = buildOwnerRoleStrapiMock();
    const strapi = { db: mock.db, service: mock.service };

    await ensureOwnerRole({ strapi: strapi as never });

    const scopedActions = mock.getPermissionsWithNestedFields.mock.calls[0][0] as Array<{
      actionId: string;
      subjects: string[];
    }>;

    for (const action of scopedActions) {
      expect(action.subjects).toHaveLength(1);
    }

    const propertyActionIds = scopedActions
      .filter((a) => a.subjects[0] === "api::property.property")
      .map((a) => a.actionId)
      .sort();
    expect(propertyActionIds).toEqual(
      [...OWNER_CONTENT_TYPE_ACTIONS["api::property.property"]].sort(),
    );

    const bookingRequestActionIds = scopedActions
      .filter((a) => a.subjects[0] === "api::booking-request.booking-request")
      .map((a) => a.actionId)
      .sort();
    expect(bookingRequestActionIds).toEqual(
      [...OWNER_CONTENT_TYPE_ACTIONS["api::booking-request.booking-request"]].sort(),
    );

    expect(scopedActions.some((a) => a.subjects[0] === "api::availability.availability")).toBe(
      false,
    );
  });

  it("accorde l’accès à la médiathèque nécessaire à l’upload de photos", async () => {
    const mock = buildOwnerRoleStrapiMock();
    const strapi = { db: mock.db, service: mock.service };

    await ensureOwnerRole({ strapi: strapi as never });

    const permissions = mock.assignPermissions.mock.calls[0][1] as Array<{ action: string }>;
    const grantedActions = permissions.map((p) => p.action);

    for (const action of OWNER_MEDIA_LIBRARY_ACTIONS) {
      expect(grantedActions).toContain(action);
    }
  });
});
