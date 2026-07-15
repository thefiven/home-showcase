import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildPropertiesListUrl,
  buildPropertyBySlugUrl,
  buildSlugsUrl,
  getAllSlugs,
  getProperties,
  getPropertyBySlug,
  mediaUrl,
  resolvePublicBaseUrl,
  resolveServerBaseUrl,
} from "./client";
import type { Property, StrapiCollectionResponse } from "./types";

const ENV = {
  NEXT_PUBLIC_STRAPI_URL: "http://localhost:1337",
  STRAPI_INTERNAL_URL: "http://cms:1337",
};

function collectionResponse<T>(data: T[]): StrapiCollectionResponse<T> {
  return { data, meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: data.length } } };
}

const PROPERTY: Property = {
  id: 1,
  documentId: "abc123",
  name: "Loft du Vieux Port",
  slug: "loft-du-vieux-port",
};

describe("resolveServerBaseUrl", () => {
  it("privilégie STRAPI_INTERNAL_URL (résolu par le conteneur web pour le SSR)", () => {
    expect(resolveServerBaseUrl(ENV)).toBe("http://cms:1337");
  });

  it("retombe sur NEXT_PUBLIC_STRAPI_URL si STRAPI_INTERNAL_URL est absent", () => {
    expect(resolveServerBaseUrl({ NEXT_PUBLIC_STRAPI_URL: "http://localhost:1337" })).toBe(
      "http://localhost:1337",
    );
  });

  it("retire le slash final", () => {
    expect(resolveServerBaseUrl({ STRAPI_INTERNAL_URL: "http://cms:1337/" })).toBe("http://cms:1337");
  });

  it("lève une erreur si aucune URL n'est configurée", () => {
    expect(() => resolveServerBaseUrl({})).toThrow();
  });
});

describe("resolvePublicBaseUrl", () => {
  it("utilise toujours NEXT_PUBLIC_STRAPI_URL, jamais l'URL interne", () => {
    expect(resolvePublicBaseUrl(ENV)).toBe("http://localhost:1337");
  });

  it("lève une erreur si NEXT_PUBLIC_STRAPI_URL est absent", () => {
    expect(() => resolvePublicBaseUrl({ STRAPI_INTERNAL_URL: "http://cms:1337" })).toThrow();
  });
});

describe("mediaUrl", () => {
  it("préfixe un chemin relatif avec l'URL publique (résolvable par le navigateur)", () => {
    expect(mediaUrl("/uploads/photo.jpg", ENV)).toBe("http://localhost:1337/uploads/photo.jpg");
  });

  it("laisse une URL déjà absolue inchangée", () => {
    expect(mediaUrl("https://cdn.example.com/photo.jpg", ENV)).toBe("https://cdn.example.com/photo.jpg");
  });

  it("retourne null si le chemin est absent", () => {
    expect(mediaUrl(null, ENV)).toBeNull();
    expect(mediaUrl(undefined, ENV)).toBeNull();
  });
});

describe("buildPropertiesListUrl", () => {
  it("cible l'URL serveur et populate photos/location/pricing/amenities", () => {
    const url = new URL(buildPropertiesListUrl("fr", ENV));
    expect(url.origin).toBe("http://cms:1337");
    expect(url.pathname).toBe("/api/properties");
    expect(url.searchParams.get("locale")).toBe("fr");
    expect(url.searchParams.get("populate[photos]")).toBe("true");
    expect(url.searchParams.get("populate[location]")).toBe("true");
    expect(url.searchParams.get("populate[pricing]")).toBe("true");
    expect(url.searchParams.get("populate[amenities]")).toBe("true");
  });
});

describe("buildPropertyBySlugUrl", () => {
  it("filtre sur le slug et demande le populate complet", () => {
    const url = new URL(buildPropertyBySlugUrl("loft-du-vieux-port", "en", ENV));
    expect(url.searchParams.get("filters[slug][$eq]")).toBe("loft-du-vieux-port");
    expect(url.searchParams.get("locale")).toBe("en");
    expect(url.searchParams.get("populate")).toBe("*");
  });
});

describe("buildSlugsUrl", () => {
  it("ne demande que le champ slug, en locale par défaut", () => {
    const url = new URL(buildSlugsUrl(ENV));
    expect(url.searchParams.get("fields[0]")).toBe("slug");
    expect(url.searchParams.get("locale")).toBe("fr");
  });
});

describe("appels réseau (fetch mocké)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_STRAPI_URL = ENV.NEXT_PUBLIC_STRAPI_URL;
    process.env.STRAPI_INTERNAL_URL = ENV.STRAPI_INTERNAL_URL;
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("getProperties retourne les logements de la réponse Strapi", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => collectionResponse([PROPERTY]),
    } as Response);

    await expect(getProperties()).resolves.toEqual([PROPERTY]);
  });

  it("getProperties retourne [] si Strapi répond en erreur (ne fait pas planter la page)", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response);

    await expect(getProperties()).resolves.toEqual([]);
  });

  it("getProperties retourne [] si fetch rejette (Strapi injoignable)", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    await expect(getProperties()).resolves.toEqual([]);
  });

  it("getPropertyBySlug retourne le premier résultat", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => collectionResponse([PROPERTY]),
    } as Response);

    await expect(getPropertyBySlug("loft-du-vieux-port")).resolves.toEqual(PROPERTY);
  });

  it("getPropertyBySlug retourne null si aucun logement ne correspond", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => collectionResponse([]),
    } as Response);

    await expect(getPropertyBySlug("inconnu")).resolves.toBeNull();
  });

  it("getAllSlugs retourne la liste des slugs", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => collectionResponse([{ slug: "loft-du-vieux-port" }, { slug: "cabane-du-lac" }]),
    } as Response);

    await expect(getAllSlugs()).resolves.toEqual(["loft-du-vieux-port", "cabane-du-lac"]);
  });

  it("getAllSlugs retourne [] si Strapi est injoignable (generateStaticParams ne doit pas planter le build)", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    await expect(getAllSlugs()).resolves.toEqual([]);
  });

  it("getProperties replie sur la locale par défaut si la locale demandée n'a aucune entrée traduite", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => collectionResponse([]) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => collectionResponse([PROPERTY]) } as Response);

    await expect(getProperties("en")).resolves.toEqual([PROPERTY]);

    const [firstCallUrl] = vi.mocked(fetch).mock.calls[0];
    const [secondCallUrl] = vi.mocked(fetch).mock.calls[1];
    expect(new URL(firstCallUrl as string).searchParams.get("locale")).toBe("en");
    expect(new URL(secondCallUrl as string).searchParams.get("locale")).toBe("fr");
  });

  it("getProperties ne replie pas si la locale demandée est déjà la locale par défaut", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => collectionResponse([]) } as Response);

    await expect(getProperties("fr")).resolves.toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("getPropertyBySlug replie sur la locale par défaut si le logement n'est pas traduit", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => collectionResponse([]) } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => collectionResponse([PROPERTY]),
      } as Response);

    await expect(getPropertyBySlug("loft-du-vieux-port", "en")).resolves.toEqual(PROPERTY);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("getPropertyBySlug retourne null si absent même après repli", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => collectionResponse([]) } as Response);

    await expect(getPropertyBySlug("inconnu", "en")).resolves.toBeNull();
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
