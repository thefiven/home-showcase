import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllSlugs, getPropertyBySlug } from "@/lib/strapi/client";
import { PropertyGallery } from "@/components/PropertyGallery";
import { PropertyDescription } from "@/components/PropertyDescription";
import { PricingSummary } from "@/components/PricingSummary";
import { AmenitiesList } from "@/components/AmenitiesList";
import styles from "./page.module.css";

export const revalidate = 60;

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PropertyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) return {};

  return {
    title: property.name,
    description: property.shortDescription || undefined,
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    notFound();
  }

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

      <PropertyDescription content={property.description} />

      <AmenitiesList amenities={property.amenities} />
    </main>
  );
}
