import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";
import styles from "./SiteNav.module.css";

interface SiteNavProps {
  locale: Locale;
  dictionary: Dictionary;
}

export function SiteNav({ locale, dictionary }: SiteNavProps) {
  return (
    <header className={styles.header}>
      <Link href={`/${locale}`} className={styles.siteTitle}>
        <Logo size="nav" />
        {dictionary.nav.siteTitle}
      </Link>
      <div className={styles.right}>
        <Link href={`/${locale}/properties`}>{dictionary.nav.properties}</Link>
        <LanguageSwitcher currentLocale={locale} label={dictionary.languageSwitcher.label} />
      </div>
    </header>
  );
}
