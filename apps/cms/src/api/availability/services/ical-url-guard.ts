/**
 * Guards against SSRF via a property's admin-configurable `icalUrl`: the
 * "Propriétaire" role can set this field but has no server/network access,
 * so it must never let the server-side sync fetch reach internal hosts
 * (cluster services, cloud metadata endpoints, loopback).
 */
import dns from "node:dns/promises";

export class UnsafeIcalUrlError extends Error {}

const PRIVATE_IPV4_RANGES: Array<[string, number]> = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10], // carrier-grade NAT
  ["127.0.0.0", 8],
  ["169.254.0.0", 16], // link-local, includes 169.254.169.254 cloud metadata
  ["172.16.0.0", 12],
  ["192.168.0.0", 16],
];

function ipv4ToInt(ip: string): number {
  return ip.split(".").reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0;
}

function isPrivateIpv4(address: string): boolean {
  const addressInt = ipv4ToInt(address);
  return PRIVATE_IPV4_RANGES.some(([base, prefixBits]) => {
    const mask = prefixBits === 0 ? 0 : (~0 << (32 - prefixBits)) >>> 0;
    return (addressInt & mask) === (ipv4ToInt(base) & mask);
  });
}

function isPrivateIpv6(address: string): boolean {
  const normalized = address.toLowerCase();
  return (
    normalized === "::1" ||
    normalized.startsWith("::ffff:") ||
    normalized.startsWith("fe80:") || // link-local
    normalized.startsWith("fc") || // unique local fc00::/7
    normalized.startsWith("fd")
  );
}

/**
 * Throws `UnsafeIcalUrlError` unless `rawUrl` is an https URL that resolves
 * only to public IP addresses. Call both when a property's `icalUrl` is
 * written and immediately before each sync fetch (DNS can change between
 * the two).
 */
export async function assertSafeIcalUrl(rawUrl: string): Promise<void> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new UnsafeIcalUrlError(`"${rawUrl}" is not a valid URL`);
  }

  if (url.protocol !== "https:") {
    throw new UnsafeIcalUrlError("iCal URL must use https://");
  }

  const addresses = await dns.lookup(url.hostname, { all: true, verbatim: true });
  if (addresses.length === 0) {
    throw new UnsafeIcalUrlError(`"${url.hostname}" did not resolve to any address`);
  }

  for (const { address, family } of addresses) {
    const isPrivate = family === 6 ? isPrivateIpv6(address) : isPrivateIpv4(address);
    if (isPrivate) {
      throw new UnsafeIcalUrlError(
        `iCal URL host "${url.hostname}" resolves to a private address (${address})`,
      );
    }
  }
}
