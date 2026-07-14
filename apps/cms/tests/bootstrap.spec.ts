import { describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_LOCALE_CODE,
  ensureLocales,
  ensurePublicReadPermissions,
  PUBLIC_READ_ACTIONS,
  REQUIRED_LOCALES,
} from '../src/bootstrap';

function buildLocalesServiceMock(existingCodes: string[] = []) {
  return {
    findByCode: vi.fn((code: string) =>
      Promise.resolve(existingCodes.includes(code) ? { code } : null)
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

describe('ensureLocales', () => {
  it('crée fr et en quand aucune locale n’existe, puis fixe fr par défaut', async () => {
    const localesService = buildLocalesServiceMock([]);
    const strapi = buildStrapiWithLocalesService(localesService);

    await ensureLocales({ strapi: strapi as never });

    expect(localesService.create).toHaveBeenCalledTimes(REQUIRED_LOCALES.length);
    for (const locale of REQUIRED_LOCALES) {
      expect(localesService.create).toHaveBeenCalledWith(locale);
    }
    expect(localesService.setDefaultLocale).toHaveBeenCalledWith({ code: DEFAULT_LOCALE_CODE });
  });

  it('ne recrée pas les locales déjà présentes (idempotent)', async () => {
    const localesService = buildLocalesServiceMock(['fr', 'en']);
    const strapi = buildStrapiWithLocalesService(localesService);

    await ensureLocales({ strapi: strapi as never });

    expect(localesService.create).not.toHaveBeenCalled();
    expect(localesService.setDefaultLocale).toHaveBeenCalledWith({ code: DEFAULT_LOCALE_CODE });
  });

  it('recrée uniquement la locale manquante', async () => {
    const localesService = buildLocalesServiceMock(['fr']);
    const strapi = buildStrapiWithLocalesService(localesService);

    await ensureLocales({ strapi: strapi as never });

    expect(localesService.create).toHaveBeenCalledTimes(1);
    expect(localesService.create).toHaveBeenCalledWith({ code: 'en', name: 'English (en)' });
  });
});

const PUBLIC_ROLE = { id: 7, type: 'public' };

function buildDbMock({
  publicRole = PUBLIC_ROLE as typeof PUBLIC_ROLE | null,
  existingActions = [] as string[],
} = {}) {
  const permissionFindOne = vi.fn(({ where }: { where: { action: string; role: number } }) =>
    Promise.resolve(existingActions.includes(where.action) ? { id: 1, ...where } : null)
  );
  const permissionCreate = vi.fn(() => Promise.resolve({}));
  const roleFindOne = vi.fn(() => Promise.resolve(publicRole));

  const query = vi.fn((uid: string) => {
    if (uid === 'plugin::users-permissions.role') {
      return { findOne: roleFindOne };
    }
    if (uid === 'plugin::users-permissions.permission') {
      return { findOne: permissionFindOne, create: permissionCreate };
    }
    throw new Error(`Unexpected query uid in test: ${uid}`);
  });

  return { query, roleFindOne, permissionFindOne, permissionCreate };
}

describe('ensurePublicReadPermissions', () => {
  it('accorde find/findOne sur Property et Availability au rôle public', async () => {
    const db = buildDbMock();
    const strapi = { db, log: { warn: vi.fn() } };

    await ensurePublicReadPermissions({ strapi: strapi as never });

    expect(db.permissionCreate).toHaveBeenCalledTimes(PUBLIC_READ_ACTIONS.length);
    for (const action of PUBLIC_READ_ACTIONS) {
      expect(db.permissionCreate).toHaveBeenCalledWith({ data: { action, role: PUBLIC_ROLE.id } });
    }
  });

  it('n’accorde jamais de lecture publique sur BookingRequest', async () => {
    const db = buildDbMock();
    const strapi = { db, log: { warn: vi.fn() } };

    await ensurePublicReadPermissions({ strapi: strapi as never });

    const grantedActions = db.permissionCreate.mock.calls.map(([{ data }]) => data.action);
    expect(grantedActions.some((action) => action.includes('booking-request'))).toBe(false);
  });

  it('ne recrée pas les permissions déjà accordées (idempotent)', async () => {
    const db = buildDbMock({ existingActions: PUBLIC_READ_ACTIONS });
    const strapi = { db, log: { warn: vi.fn() } };

    await ensurePublicReadPermissions({ strapi: strapi as never });

    expect(db.permissionCreate).not.toHaveBeenCalled();
  });

  it('n’échoue pas et journalise un avertissement si le rôle public est introuvable', async () => {
    const db = buildDbMock({ publicRole: null });
    const warn = vi.fn();
    const strapi = { db, log: { warn } };

    await expect(ensurePublicReadPermissions({ strapi: strapi as never })).resolves.toBeUndefined();

    expect(warn).toHaveBeenCalledOnce();
    expect(db.permissionCreate).not.toHaveBeenCalled();
  });
});
