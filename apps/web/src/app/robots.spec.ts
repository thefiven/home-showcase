import { afterEach, beforeEach, describe, expect, it } from "vitest";
import robots from "./robots";

describe("robots", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://exemple.com";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("autorise l'indexation et pointe vers le sitemap", () => {
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: "https://exemple.com/sitemap.xml",
      host: "https://exemple.com",
    });
  });
});
