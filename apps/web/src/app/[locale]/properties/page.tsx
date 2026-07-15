import type { Metadata } from "next";
import { getProperties } from "@/lib/strapi/client";
import { PropertyCard } from "@/components/PropertyCard";
import styles from "./page.module.css";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Nos logements",
  description: "Découvrez nos logements disponibles à la réservation.",
};

export default async function PropertiesPage() {
  const properties = await getProperties();

  if (properties.length === 0) {
    return (
      <main className={styles.main}>
        <h1>Nos logements</h1>
        <p>Aucun logement n&apos;est publié pour le moment.</p>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <h1>Nos logements</h1>
      <div className={styles.grid}>
        {properties.map((property) => (
          <PropertyCard key={property.documentId} property={property} />
        ))}
      </div>
    </main>
  );
}
