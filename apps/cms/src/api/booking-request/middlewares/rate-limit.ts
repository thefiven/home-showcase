import type { Core } from "@strapi/strapi";

export interface RateLimitOptions {
  max: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterMs?: number;
}

/**
 * Sliding-window rate limit check, kept pure and Strapi/Koa-free so it's
 * directly unit-testable. `store` maps a key (IP) to its recent request
 * timestamps; entries outside the window are pruned lazily on each check —
 * no separate cleanup job needed.
 */
export function checkRateLimit(
  store: Map<string, number[]>,
  key: string,
  now: number,
  { max, windowMs }: RateLimitOptions,
): RateLimitResult {
  const windowStart = now - windowMs;
  const timestamps = (store.get(key) ?? []).filter((timestamp) => timestamp > windowStart);

  if (timestamps.length >= max) {
    store.set(key, timestamps);
    return { allowed: false, retryAfterMs: timestamps[0] + windowMs - now };
  }

  timestamps.push(now);
  store.set(key, timestamps);
  return { allowed: true };
}

const DEFAULT_MAX = 5;
const DEFAULT_WINDOW_MS = 60 * 60 * 1000;

function readRateLimitOptions(): RateLimitOptions {
  const max = Number(process.env.BOOKING_RATE_LIMIT_MAX);
  const windowMs = Number(process.env.BOOKING_RATE_LIMIT_WINDOW_MS);
  return {
    max: Number.isFinite(max) && max > 0 ? max : DEFAULT_MAX,
    windowMs: Number.isFinite(windowMs) && windowMs > 0 ? windowMs : DEFAULT_WINDOW_MS,
  };
}

/**
 * Per-IP request timestamps for the booking-request create endpoint.
 * Module-scoped singleton: fine for a single Strapi instance (current
 * homelab target), but not shared across replicas — revisit if this ever
 * runs behind multiple instances (issue #13).
 */
const requestTimestampsByIp = new Map<string, number[]>();

/**
 * Throttles the public, unauthenticated POST /booking-requests. Each
 * request now also triggers a real SMTP send to the owner (issue #10), so
 * unbounded spam risks flooding/blacklisting the configured mailbox
 * (issue #42) on top of polluting the BookingRequest table.
 */
const rateLimitMiddleware: Core.MiddlewareFactory = (_config, { strapi }) => {
  const options = readRateLimitOptions();

  return async (ctx, next) => {
    const key = ctx.request.ip ?? "unknown";
    const { allowed, retryAfterMs } = checkRateLimit(
      requestTimestampsByIp,
      key,
      Date.now(),
      options,
    );

    if (!allowed) {
      strapi.log.warn(`Rate limit exceeded for booking request creation from ${key}`);
      ctx.status = 429;
      ctx.set("Retry-After", String(Math.max(1, Math.ceil((retryAfterMs ?? 0) / 1000))));
      ctx.body = {
        error: {
          status: 429,
          name: "TooManyRequestsError",
          message: "Trop de demandes de réservation depuis cette adresse. Réessayez plus tard.",
        },
      };
      return;
    }

    await next();
  };
};

export default rateLimitMiddleware;
