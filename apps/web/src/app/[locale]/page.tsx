import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { resolveLocale } from "@/i18n/config";
import styles from "./page.module.css";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const dictionary = getDictionary(locale);

  return (
    <main className={styles.main}>
      <h1>{dictionary.home.title}</h1>
      <p>{dictionary.home.description}</p>
      <Link href={`/${locale}/properties`} className={styles.cta}>
        {dictionary.home.cta}
      </Link>
    </main>
  );
}
