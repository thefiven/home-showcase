import Image from "next/image";
import type { Dictionary } from "@/i18n/dictionaries";
import { mediaUrl } from "@/lib/strapi/client";
import type { Property } from "@/lib/strapi/types";
import { HeroScrollFade } from "@/components/HeroScrollFade";

const CTA_BASE = "inline-flex items-center rounded-flat px-12 py-7 font-medium";

export function PropertyHero({
  property,
  dictionary,
}: {
  property: Property;
  dictionary: Dictionary;
}) {
  const cover = property.photos?.[0];
  const eyebrow = [property.location?.city, property.location?.country].filter(Boolean).join(" · ");

  return (
    <section className="relative flex min-h-[clamp(440px,62vw,720px)] items-end overflow-hidden bg-surface-dark">
      {cover ? (
        <Image
          src={mediaUrl(cover.url)!}
          alt={cover.alternativeText || dictionary.hero.noPhotoAlt.replace("{name}", property.name)}
          fill
          sizes="100vw"
          priority
          className="object-cover"
        />
      ) : null}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_srgb,var(--color-surface-dark)_90%,transparent),color-mix(in_srgb,var(--color-surface-dark)_35%,transparent))]" />
      <HeroScrollFade>
        <div className="relative z-[1] px-[var(--pad-nav-x)] pt-[clamp(28px,5vw,64px)] pb-[clamp(48px,7vw,88px)] text-foreground-on-dark">
          {eyebrow && (
            <p className="mb-8 font-mono text-[13px] tracking-[0.14em] uppercase">{eyebrow}</p>
          )}
          <h1 className="max-w-[16ch] text-[clamp(2.4rem,6vw,4.4rem)] leading-[1.05] text-foreground-on-dark">
            {property.name}
          </h1>
          {property.shortDescription && (
            <p className="mt-8 max-w-[58ch] text-[color-mix(in_srgb,var(--color-foreground-on-dark)_85%,transparent)]">
              {property.shortDescription}
            </p>
          )}
          <div className="mt-16 flex flex-wrap gap-[clamp(14px,3vw,28px)]">
            <a
              href="#reservation"
              className={`${CTA_BASE} bg-gorse text-foreground-on-dark hover:bg-gorse-hover`}
            >
              {dictionary.hero.ctaAvailability}
            </a>
            <a
              href="#galerie"
              className={`${CTA_BASE} border border-[color-mix(in_srgb,var(--color-foreground-on-dark)_60%,transparent)] text-foreground-on-dark hover:border-foreground-on-dark`}
            >
              {dictionary.hero.ctaGallery}
            </a>
          </div>
        </div>
      </HeroScrollFade>
    </section>
  );
}
