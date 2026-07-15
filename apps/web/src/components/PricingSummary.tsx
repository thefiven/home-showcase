import type { PropertyPricing } from "@/lib/strapi/types";
import styles from "./PricingSummary.module.css";

const CURRENCY_SYMBOLS: Record<PropertyPricing["currency"], string> = {
  EUR: "€",
  USD: "$",
  GBP: "£",
};

function formatAmount(amount: number, currency: PropertyPricing["currency"]) {
  return `${amount.toFixed(0)}${CURRENCY_SYMBOLS[currency]}`;
}

export function PricingSummary({ pricing }: { pricing?: PropertyPricing | null }) {
  if (!pricing) return null;

  return (
    <div className={styles.pricing}>
      <p className={styles.perNight}>
        <strong>{formatAmount(pricing.basePricePerNight, pricing.currency)}</strong> / nuit
      </p>
      {pricing.cleaningFee != null && (
        <p className={styles.fee}>
          + {formatAmount(pricing.cleaningFee, pricing.currency)} de frais de ménage
        </p>
      )}
    </div>
  );
}
