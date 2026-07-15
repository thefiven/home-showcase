import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { defaultLocale } from "@/i18n/config";
import styles from "./page.module.css";

/**
 * `not-found.tsx` ne reçoit pas les `params` de la route : la locale n'est pas
 * connue avec certitude (ex. segment après le préfixe de locale sans correspondance),
 * donc on retombe sur `defaultLocale` plutôt que de planter.
 */
export default function NotFound() {
  const dictionary = getDictionary(defaultLocale);

  return (
    <main className={styles.main}>
      <h1>{dictionary.notFound.title}</h1>
      <p>{dictionary.notFound.description}</p>
      <Link href={`/${defaultLocale}`} className={styles.cta}>
        {dictionary.notFound.backHome}
      </Link>
    </main>
  );
}
