"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { locales, type Locale } from "@/i18n/config";
import { withLocale } from "@/i18n/withLocale";
import styles from "./LanguageSwitcher.module.css";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  label: string;
}

export function LanguageSwitcher({ currentLocale, label }: LanguageSwitcherProps) {
  const pathname = usePathname();

  return (
    <nav aria-label={label} className={styles.switcher}>
      {locales.map((locale) => (
        <Link
          key={locale}
          href={withLocale(pathname, locale)}
          aria-current={locale === currentLocale ? "true" : undefined}
          className={locale === currentLocale ? styles.active : undefined}
        >
          {locale.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
