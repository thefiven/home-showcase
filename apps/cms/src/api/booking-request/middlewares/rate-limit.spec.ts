import { describe, expect, it, vi } from "vitest";
import rateLimitMiddleware, { checkRateLimit } from "./rate-limit";

describe("checkRateLimit", () => {
  const options = { max: 3, windowMs: 1000 };

  it("autorise les requêtes sous le seuil", () => {
    const store = new Map<string, number[]>();

    expect(checkRateLimit(store, "1.2.3.4", 0, options)).toEqual({ allowed: true });
    expect(checkRateLimit(store, "1.2.3.4", 100, options)).toEqual({ allowed: true });
    expect(checkRateLimit(store, "1.2.3.4", 200, options)).toEqual({ allowed: true });
  });

  it("bloque au-delà du seuil, dans la fenêtre", () => {
    const store = new Map<string, number[]>();
    checkRateLimit(store, "1.2.3.4", 0, options);
    checkRateLimit(store, "1.2.3.4", 100, options);
    checkRateLimit(store, "1.2.3.4", 200, options);

    const result = checkRateLimit(store, "1.2.3.4", 300, options);

    expect(result.allowed).toBe(false);
    expect(result.retryAfterMs).toBe(0 + options.windowMs - 300);
  });

  it("autorise de nouveau une fois la fenêtre expirée", () => {
    const store = new Map<string, number[]>();
    checkRateLimit(store, "1.2.3.4", 0, options);
    checkRateLimit(store, "1.2.3.4", 100, options);
    checkRateLimit(store, "1.2.3.4", 200, options);

    const result = checkRateLimit(store, "1.2.3.4", 1300, options);

    expect(result.allowed).toBe(true);
  });

  it("traite chaque clé (IP) indépendamment", () => {
    const store = new Map<string, number[]>();
    checkRateLimit(store, "1.1.1.1", 0, options);
    checkRateLimit(store, "1.1.1.1", 100, options);
    checkRateLimit(store, "1.1.1.1", 200, options);

    expect(checkRateLimit(store, "2.2.2.2", 300, options)).toEqual({ allowed: true });
  });
});

describe("rateLimitMiddleware", () => {
  function buildStrapi() {
    return { log: { warn: vi.fn() } } as never;
  }

  function buildCtx(ip: string) {
    const headers: Record<string, string> = {};
    return {
      request: { ip },
      status: 200,
      body: undefined as unknown,
      set(name: string, value: string) {
        headers[name] = value;
      },
      headers,
    };
  }

  it("laisse passer une requête isolée", async () => {
    const strapi = buildStrapi();
    const handler = rateLimitMiddleware({}, { strapi }) as (
      ctx: unknown,
      next: () => Promise<void>,
    ) => Promise<void>;
    const ctx = buildCtx("9.9.9.9");
    const next = vi.fn(() => Promise.resolve());

    await handler(ctx, next);

    expect(next).toHaveBeenCalledOnce();
    expect(ctx.status).toBe(200);
  });

  it("renvoie 429 avec Retry-After une fois le seuil par défaut dépassé", async () => {
    const strapi = buildStrapi();
    const handler = rateLimitMiddleware({}, { strapi }) as (
      ctx: unknown,
      next: () => Promise<void>,
    ) => Promise<void>;
    const ip = "8.8.8.8";
    const next = vi.fn(() => Promise.resolve());

    for (let i = 0; i < 5; i += 1) {
      await handler(buildCtx(ip), next);
    }
    const blockedCtx = buildCtx(ip);
    await handler(blockedCtx, next);

    expect(blockedCtx.status).toBe(429);
    expect(blockedCtx.headers["Retry-After"]).toBeDefined();
    expect(strapi.log.warn).toHaveBeenCalled();
  });
});
