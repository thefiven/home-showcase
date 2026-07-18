"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { locales, type Locale } from "@/i18n/config";
import { withLocale } from "@/i18n/withLocale";

interface LanguageSwitcherProps {
  currentLocale: Locale;
  label: string;
}

export function LanguageSwitcher({ currentLocale, label }: LanguageSwitcherProps) {
  const pathname = usePathname();

  return (
    <nav
      aria-label={label}
      className="flex items-center gap-4 rounded-pill border border-border-strong px-6 py-2 font-mono text-xs tracking-[0.12em] uppercase"
    >
      {locales.map((locale) => {
        const isActive = locale === currentLocale;
        return (
          <Link
            key={locale}
            href={withLocale(pathname, locale)}
            aria-current={isActive ? "true" : undefined}
            className={
              isActive
                ? "font-bold text-atlantic no-underline"
                : "text-foreground-soft no-underline hover:text-atlantic"
            }
          >
            {locale.toUpperCase()}
          </Link>
        );
      })}
    </nav>
  );
}
