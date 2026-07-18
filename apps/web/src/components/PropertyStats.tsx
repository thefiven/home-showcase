import type { Dictionary } from "@/i18n/dictionaries";
import { formatAmount } from "@/lib/pricing";
import type { PropertyLocation, PropertyPricing } from "@/lib/strapi/types";

interface PropertyStatsProps {
  pricing?: PropertyPricing | null;
  maxGuests?: number | null;
  location?: PropertyLocation | null;
  dictionary: Dictionary;
}

export function PropertyStats({ pricing, maxGuests, location, dictionary }: PropertyStatsProps) {
  const tiles = [
    pricing && {
      value: formatAmount(pricing.basePricePerNight, pricing.currency),
      label: dictionary.stats.perNight,
      accent: true,
    },
    maxGuests != null && {
      value: String(maxGuests),
      label: dictionary.stats.maxGuests,
      accent: false,
    },
    location?.proximityNote && { value: location.proximityNote, label: "", accent: false },
    pricing?.cleaningFee != null && {
      value: formatAmount(pricing.cleaningFee, pricing.currency),
      label: dictionary.stats.cleaningFee,
      accent: false,
    },
  ].filter((tile): tile is { value: string; label: string; accent: boolean } => Boolean(tile));

  if (tiles.length === 0) return null;

  return (
    <section className="flex flex-wrap gap-[clamp(24px,5vw,64px)] bg-surface-dark px-[var(--pad-nav-x)] py-16 text-foreground-on-dark">
      {tiles.map((tile, index) => (
        <div key={index}>
          <p
            className={
              tile.accent
                ? "font-mono text-[22px] font-bold text-gorse"
                : "font-mono text-[22px] font-bold text-foreground-on-dark"
            }
          >
            {tile.value}
          </p>
          {tile.label && (
            <p className="mt-1 text-sm text-[color-mix(in_srgb,var(--color-foreground-on-dark)_75%,transparent)]">
              {tile.label}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
