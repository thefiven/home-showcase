import type { Metadata } from "next";
import { getProperties } from "@/lib/strapi/client";
import { PropertyCard } from "@/components/PropertyCard";
import { getDictionary } from "@/i18n/dictionaries";
import { resolveLocale } from "@/i18n/config";
import styles from "./page.module.css";

export const revalidate = 60;

interface PropertiesPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: PropertiesPageProps): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const dictionary = getDictionary(resolveLocale(rawLocale));
  return {
    title: dictionary.properties.title,
  };
}

export default async function PropertiesPage({ params }: PropertiesPageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const dictionary = getDictionary(locale);
  const properties = await getProperties(locale);

  if (properties.length === 0) {
    return (
      <main className={styles.main}>
        <h1>{dictionary.properties.title}</h1>
        <p>{dictionary.properties.empty}</p>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <h1>{dictionary.properties.title}</h1>
      <div className={styles.grid}>
        {properties.map((property) => (
          <PropertyCard key={property.documentId} property={property} locale={locale} />
        ))}
      </div>
    </main>
  );
}
