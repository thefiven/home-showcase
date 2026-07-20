import type { PropertyPricing } from "@/lib/strapi/types";

const CURRENCY_SYMBOLS: Record<PropertyPricing["currency"], string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

/** Formats an amount with no decimals and the currency symbol (e.g. `145€`). */
export function formatAmount(amount: number, currency: PropertyPricing["currency"]): string {
  return `${amount.toFixed(0)}${CURRENCY_SYMBOLS[currency]}`;
}
