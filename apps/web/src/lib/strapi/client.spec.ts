import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  buildAvailabilitiesForPropertyUrl,
  buildBookingRequestCreateUrl,
  buildPropertiesListUrl,
  buildPropertyBySlugUrl,
  buildSlugsUrl,
  createBookingRequest,
  getAllSlugs,
  getAvailabilitiesForProperty,
  getProperties,
  getPropertyBySlug,
  mediaUrl,
  resolvePublicBaseUrl,
  resolveServerBaseUrl,
} from "./client";
import type { Availability, Property, StrapiCollectionResponse } from "./types";

const ENV = {
  NEXT_PUBLIC_STRAPI_URL: "http://localhost:1337",
  STRAPI_INTERNAL_URL: "http://cms:1337",
};

function collectionResponse<T>(data: T[]): StrapiCollectionResponse<T> {
  return {
    data,
    meta: { pagination: { page: 1, pageSize: 25, pageCount: 1, total: data.length } },
  };
}

const PROPERTY: Property = {
  id: 1,
  documentId: "abc123",
  name: "Loft du Vieux Port",
  slug: "loft-du-vieux-port",
};

describe("resolveServerBaseUrl", () => {
  it("prioritizes STRAPI_INTERNAL_URL (resolved by the web container for SSR)", () => {
    expect(resolveServerBaseUrl(ENV)).toBe("http://cms:1337");
  });

  it("falls back to NEXT_PUBLIC_STRAPI_URL if STRAPI_INTERNAL_URL is absent", () => {
    expect(resolveServerBaseUrl({ NEXT_PUBLIC_STRAPI_URL: "http://localhost:1337" })).toBe(
      "http://localhost:1337",
    );
  });

  it("strips the trailing slash", () => {
    expect(resolveServerBaseUrl({ STRAPI_INTERNAL_URL: "http://cms:1337/" })).toBe(
      "http://cms:1337",
    );
  });

  it("throws an error if no URL is configured", () => {
    expect(() => resolveServerBaseUrl({})).toThrow();
  });
});

describe("resolvePublicBaseUrl", () => {
  it("always uses NEXT_PUBLIC_STRAPI_URL, never the internal URL", () => {
    expect(resolvePublicBaseUrl(ENV)).toBe("http://localhost:1337");
  });

  it("throws an error if NEXT_PUBLIC_STRAPI_URL is absent", () => {
    expect(() => resolvePublicBaseUrl({ STRAPI_INTERNAL_URL: "http://cms:1337" })).toThrow();
  });
});

describe("mediaUrl", () => {
  it("prefixes a relative path with the server URL (the next/image optimizer fetches from the web container, not from the browser)", () => {
    expect(mediaUrl("/uploads/photo.jpg", ENV)).toBe("http://cms:1337/uploads/photo.jpg");
  });

  it("falls back to the public URL if STRAPI_INTERNAL_URL is absent", () => {
    expect(
      mediaUrl("/uploads/photo.jpg", { NEXT_PUBLIC_STRAPI_URL: "http://localhost:1337" }),
    ).toBe("http://localhost:1337/uploads/photo.jpg");
  });

  it("leaves an already-absolute URL unchanged", () => {
    expect(mediaUrl("https://cdn.example.com/photo.jpg", ENV)).toBe(
      "https://cdn.example.com/photo.jpg",
    );
  });

  it("returns null if the path is absent", () => {
    expect(mediaUrl(null, ENV)).toBeNull();
    expect(mediaUrl(undefined, ENV)).toBeNull();
  });
});

describe("buildPropertiesListUrl", () => {
  it("targets the server URL and populates photos/location/pricing/amenities", () => {
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
  it("filters on the slug and requests the full populate", () => {
    const url = new URL(buildPropertyBySlugUrl("loft-du-vieux-port", "en", ENV));
    expect(url.searchParams.get("filters[slug][$eq]")).toBe("loft-du-vieux-port");
    expect(url.searchParams.get("locale")).toBe("en");
    expect(url.searchParams.get("populate")).toBe("*");
  });
});

describe("buildSlugsUrl", () => {
  it("only requests the slug field, in the default locale", () => {
    const url = new URL(buildSlugsUrl(ENV));
    expect(url.searchParams.get("fields[0]")).toBe("slug");
    expect(url.searchParams.get("locale")).toBe("fr");
  });
});

describe("buildAvailabilitiesForPropertyUrl", () => {
  it("filters on the property's documentId and sorts by start date", () => {
    const url = new URL(buildAvailabilitiesForPropertyUrl("abc123", ENV));
    expect(url.pathname).toBe("/api/availabilities");
    expect(url.searchParams.get("filters[property][documentId][$eq]")).toBe("abc123");
    expect(url.searchParams.get("sort")).toBe("startDate:asc");
  });
});

describe("network calls (mocked fetch)", () => {
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

  it("getProperties returns the properties from the Strapi response", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => collectionResponse([PROPERTY]),
    } as Response);

    await expect(getProperties()).resolves.toEqual([PROPERTY]);
  });

  it("getProperties returns [] if Strapi responds with an error (does not crash the page)", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 500 } as Response);

    await expect(getProperties()).resolves.toEqual([]);
  });

  it("getProperties returns [] if fetch rejects (Strapi unreachable)", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    await expect(getProperties()).resolves.toEqual([]);
  });

  it("getPropertyBySlug returns the first result", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => collectionResponse([PROPERTY]),
    } as Response);

    await expect(getPropertyBySlug("loft-du-vieux-port")).resolves.toEqual(PROPERTY);
  });

  it("getPropertyBySlug returns null if no property matches", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => collectionResponse([]),
    } as Response);

    await expect(getPropertyBySlug("inconnu")).resolves.toBeNull();
  });

  it("getAllSlugs returns the list of slugs", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () =>
        collectionResponse([{ slug: "loft-du-vieux-port" }, { slug: "cabane-du-lac" }]),
    } as Response);

    await expect(getAllSlugs()).resolves.toEqual(["loft-du-vieux-port", "cabane-du-lac"]);
  });

  it("getAllSlugs returns [] if Strapi is unreachable (generateStaticParams must not crash the build)", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    await expect(getAllSlugs()).resolves.toEqual([]);
  });

  it("getProperties falls back to the default locale if the requested locale has no translated entry", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => collectionResponse([]) } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => collectionResponse([PROPERTY]),
      } as Response);

    await expect(getProperties("en")).resolves.toEqual([PROPERTY]);

    const [firstCallUrl] = vi.mocked(fetch).mock.calls[0];
    const [secondCallUrl] = vi.mocked(fetch).mock.calls[1];
    expect(new URL(firstCallUrl as string).searchParams.get("locale")).toBe("en");
    expect(new URL(secondCallUrl as string).searchParams.get("locale")).toBe("fr");
  });

  it("getProperties does not fall back if the requested locale is already the default locale", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => collectionResponse([]),
    } as Response);

    await expect(getProperties("fr")).resolves.toEqual([]);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("getPropertyBySlug falls back to the default locale if the property is not translated", async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({ ok: true, json: async () => collectionResponse([]) } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => collectionResponse([PROPERTY]),
      } as Response);

    await expect(getPropertyBySlug("loft-du-vieux-port", "en")).resolves.toEqual(PROPERTY);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("getPropertyBySlug returns null if absent even after falling back", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => collectionResponse([]),
    } as Response);

    await expect(getPropertyBySlug("inconnu", "en")).resolves.toBeNull();
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("getAvailabilitiesForProperty returns the property's blocked ranges", async () => {
    const availability: Availability = {
      id: 1,
      documentId: "avail-1",
      startDate: "2026-08-01",
      endDate: "2026-08-05",
      source: "airbnb",
    };
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => collectionResponse([availability]),
    } as Response);

    await expect(getAvailabilitiesForProperty("abc123")).resolves.toEqual([availability]);
  });

  it("getAvailabilitiesForProperty returns [] if Strapi is unreachable (the page must not crash)", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("network down"));

    await expect(getAvailabilitiesForProperty("abc123")).resolves.toEqual([]);
  });

  const BOOKING_PAYLOAD = {
    property: "abc123",
    startDate: "2026-08-01",
    endDate: "2026-08-05",
    guestName: "Alex Dupont",
    guestEmail: "alex@example.com",
  };

  it("createBookingRequest posts the payload as JSON to /api/booking-requests", async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({}) } as Response);

    await createBookingRequest(BOOKING_PAYLOAD);

    expect(fetch).toHaveBeenCalledWith(
      buildBookingRequestCreateUrl(ENV),
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: BOOKING_PAYLOAD }),
      }),
    );
  });

  it("createBookingRequest throws an error with the Strapi message if the request is rejected", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        error: { message: "Les dates demandées chevauchent une période indisponible." },
      }),
    } as Response);

    await expect(createBookingRequest(BOOKING_PAYLOAD)).rejects.toThrow(
      "Les dates demandées chevauchent une période indisponible.",
    );
  });

  it("createBookingRequest throws a generic error if Strapi doesn't return a message", async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
    } as Response);

    await expect(createBookingRequest(BOOKING_PAYLOAD)).rejects.toThrow(
      "Strapi request failed (500)",
    );
  });
});
