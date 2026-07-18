import type { PropertyPricing } from "@/lib/strapi/types";
import { formatAmount } from "@/lib/pricing";

export function PricingSummary({ pricing }: { pricing?: PropertyPricing | null }) {
  if (!pricing) return null;

  return (
    <div className="flex flex-col gap-1">
      <p className="font-mono text-[22px] font-bold text-gorse">
        <strong>{formatAmount(pricing.basePricePerNight, pricing.currency)}</strong> / nuit
      </p>
      {pricing.cleaningFee != null && (
        <p className="text-sm text-foreground-soft">
          + {formatAmount(pricing.cleaningFee, pricing.currency)} de frais de ménage
        </p>
      )}
    </div>
  );
}
