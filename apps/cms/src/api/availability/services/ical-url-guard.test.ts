import { describe, expect, it, vi } from "vitest";

const lookupMock = vi.fn();
vi.mock("node:dns/promises", () => ({
  default: { lookup: (...args: unknown[]) => lookupMock(...args) },
}));

const { assertSafeIcalUrl, UnsafeIcalUrlError } = await import("./ical-url-guard");

describe("assertSafeIcalUrl", () => {
  it("rejects a malformed URL", async () => {
    await expect(assertSafeIcalUrl("not-a-url")).rejects.toThrow(UnsafeIcalUrlError);
  });

  it("rejects a non-https URL", async () => {
    await expect(assertSafeIcalUrl("http://example.com/cal.ics")).rejects.toThrow("must use https");
  });

  it("rejects a hostname resolving to a private IPv4 address", async () => {
    lookupMock.mockResolvedValueOnce([{ address: "10.0.0.5", family: 4 }]);
    await expect(assertSafeIcalUrl("https://internal.example/cal.ics")).rejects.toThrow(
      "private address",
    );
  });

  it("rejects a hostname resolving to the cloud metadata link-local address", async () => {
    lookupMock.mockResolvedValueOnce([{ address: "169.254.169.254", family: 4 }]);
    await expect(assertSafeIcalUrl("https://metadata.example/cal.ics")).rejects.toThrow(
      "private address",
    );
  });

  it("rejects a hostname resolving to an IPv6 loopback address", async () => {
    lookupMock.mockResolvedValueOnce([{ address: "::1", family: 6 }]);
    await expect(assertSafeIcalUrl("https://loopback.example/cal.ics")).rejects.toThrow(
      "private address",
    );
  });

  it("accepts an https URL resolving only to public addresses", async () => {
    lookupMock.mockResolvedValueOnce([{ address: "203.0.113.10", family: 4 }]);
    await expect(assertSafeIcalUrl("https://calendar.airbnb.com/cal.ics")).resolves.toBeUndefined();
  });
});
