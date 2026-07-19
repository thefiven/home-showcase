import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getAvailabilitiesForProperty, getPropertyBySlug } from "@/lib/strapi/client";
import { PropertyHero } from "@/components/PropertyHero";
import { PropertyStats } from "@/components/PropertyStats";
import { PropertyGallery } from "@/components/PropertyGallery";
import { HostNote } from "@/components/HostNote";
import { BookingSection } from "@/components/BookingSection";
import { LocationSection } from "@/components/LocationSection";
import { getDictionary } from "@/i18n/dictionaries";
import { resolveLocale } from "@/i18n/config";
import { localizedAlternates } from "@/lib/site";

export const revalidate = 60;

interface PropertyPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  // Même URL/options que l'appel de PropertyPage : dédupliqué par la request
  // memoization fetch de Next.js (pas de round-trip Strapi supplémentaire).
  const property = await getPropertyBySlug(slug, locale);

  if (!property) return {};

  return {
    title: property.name,
    description: property.shortDescription || undefined,
    alternates: localizedAlternates(locale, `/properties/${slug}`),
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = resolveLocale(rawLocale);
  const property = await getPropertyBySlug(slug, locale);

  if (!property) {
    notFound();
  }

  const dictionary = getDictionary(locale);
  // Dépend du documentId renvoyé par getPropertyBySlug ci-dessus : séquentiel
  // par nécessité, pas parallélisable via Promise.all.
  const availabilities = await getAvailabilitiesForProperty(property.documentId);

  return (
    <>
      <PropertyHero property={property} dictionary={dictionary} />
      <PropertyStats
        pricing={property.pricing}
        maxGuests={property.maxGuests}
        location={property.location}
        dictionary={dictionary}
      />
      <main className="mx-auto flex max-w-[1000px] flex-col gap-[var(--gap-cols)] px-[var(--pad-nav-x)] py-[var(--pad-section)]">
        <div id="galerie">
          <PropertyGallery photos={property.photos} alt={property.name} dictionary={dictionary} />
        </div>

        <HostNote
          description={property.description}
          amenities={property.amenities}
          dictionary={dictionary}
        />

        <BookingSection
          availabilities={availabilities}
          locale={locale}
          dictionary={dictionary}
          propertyDocumentId={property.documentId}
        />
      </main>
      <LocationSection
        location={property.location}
        photos={property.photos}
        propertyName={property.name}
        dictionary={dictionary}
      />
    </>
  );
}
