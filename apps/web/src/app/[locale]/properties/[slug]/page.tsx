import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getAvailabilitiesForProperty, getPropertyBySlug } from "@/lib/strapi/client";
import { PropertyGallery } from "@/components/PropertyGallery";
import { PropertyDescription } from "@/components/PropertyDescription";
import { PricingSummary } from "@/components/PricingSummary";
import { AmenitiesList } from "@/components/AmenitiesList";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { BookingRequestForm } from "@/components/BookingRequestForm";
import { getDictionary } from "@/i18n/dictionaries";
import { resolveLocale } from "@/i18n/config";
import styles from "./page.module.css";

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
  // Même URL/options que l'appel de PropertyPage : dédupliqué par la request
  // memoization fetch de Next.js (pas de round-trip Strapi supplémentaire).
  const property = await getPropertyBySlug(slug, resolveLocale(rawLocale));

  if (!property) return {};

  return {
    title: property.name,
    description: property.shortDescription || undefined,
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

  const { location } = property;

  return (
    <main className={styles.main}>
      <PropertyGallery photos={property.photos} alt={property.name} />

      <div className={styles.header}>
        <h1>{property.name}</h1>
        {location && (
          <p className={styles.location}>
            {[location.addressLine, location.postalCode, location.city, location.country]
              .filter(Boolean)
              .join(", ")}
          </p>
        )}
      </div>

      <PricingSummary pricing={property.pricing} />

      <AvailabilityCalendar
        availabilities={availabilities}
        locale={locale}
        dictionary={dictionary}
      />

      <PropertyDescription content={property.description} />

      <AmenitiesList amenities={property.amenities} />

      <BookingRequestForm propertyDocumentId={property.documentId} dictionary={dictionary} />
    </main>
  );
}
