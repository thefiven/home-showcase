import type { PropertyPricing } from "@/lib/strapi/types";

const CURRENCY_SYMBOLS: Record<PropertyPricing["currency"], string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

/** Formate un montant sans décimales avec le symbole de la devise (ex. `145€`). */
export function formatAmount(amount: number, currency: PropertyPricing["currency"]): string {
  return `${amount.toFixed(0)}${CURRENCY_SYMBOLS[currency]}`;
}
