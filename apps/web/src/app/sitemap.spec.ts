import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import sitemap from "./sitemap";

describe("sitemap", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://exemple.com";
    process.env.NEXT_PUBLIC_STRAPI_URL = "http://localhost:1337";
    process.env.STRAPI_INTERNAL_URL = "http://localhost:1337";
    vi.stubGlobal("fetch", vi.fn());
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({
        data: [{ slug: "loft-du-vieux-port" }],
        meta: { pagination: { page: 1, pageSize: 100, pageCount: 1, total: 1 } },
      }),
    } as Response);
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.unstubAllGlobals();
  });

  it("lists static pages and properties for each locale", async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toEqual(
      expect.arrayContaining([
        "https://exemple.com/fr",
        "https://exemple.com/en",
        "https://exemple.com/fr/properties",
        "https://exemple.com/en/properties",
        "https://exemple.com/fr/properties/loft-du-vieux-port",
        "https://exemple.com/en/properties/loft-du-vieux-port",
      ]),
    );
    expect(entries).toHaveLength(6);
  });

  it("provides hreflang alternates for each entry", async () => {
    const entries = await sitemap();
    const home = entries.find((entry) => entry.url === "https://exemple.com/fr");

    expect(home?.alternates?.languages).toEqual({
      fr: "https://exemple.com/fr",
      en: "https://exemple.com/en",
    });
  });
});
