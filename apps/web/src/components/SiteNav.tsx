import Link from "next/link";
import type { Dictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Logo } from "./Logo";

interface SiteNavProps {
  locale: Locale;
  dictionary: Dictionary;
}

export function SiteNav({ locale, dictionary }: SiteNavProps) {
  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-[clamp(14px,3vw,28px)] border-b border-border bg-[color-mix(in_srgb,var(--color-background)_85%,transparent)] px-[var(--pad-nav-x)] py-8 backdrop-blur-[8px]">
      <Link
        href={`/${locale}`}
        className="inline-flex items-center gap-8 font-display font-semibold"
      >
        <Logo size="nav" />
        {dictionary.nav.siteTitle}
      </Link>
      <div className="flex flex-wrap items-center gap-12">
        <Link href={`/${locale}/properties`}>{dictionary.nav.properties}</Link>
        <LanguageSwitcher currentLocale={locale} label={dictionary.languageSwitcher.label} />
      </div>
    </header>
  );
}
