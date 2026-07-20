import Link from "next/link";
import { Source_Serif_4, Work_Sans, Space_Mono } from "next/font/google";
import { getDictionary } from "@/i18n/dictionaries";
import { defaultLocale } from "@/i18n/config";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import "./globals.css";

const fontDisplay = Source_Serif_4({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const fontBody = Work_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const fontMono = Space_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

/**
 * Root 404: rendered without a parent layout (the site's only layout
 * lives under `[locale]`), so it's self-sufficient — its own html/body/
 * fonts, like `[locale]/layout.tsx`. Covers URLs that don't match any
 * locale segment; since the locale isn't known here, we fall back to
 * `defaultLocale` (same choice as `[locale]/not-found.tsx`).
 */
export default function NotFound() {
  const dictionary = getDictionary(defaultLocale);

  return (
    <html
      lang={defaultLocale}
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}
    >
      <body>
        <SiteNav locale={defaultLocale} dictionary={dictionary} />
        <main className="mx-auto flex max-w-[1200px] flex-col items-start gap-8 px-[var(--pad-nav-x)] py-[var(--pad-section)]">
          <h1 className="max-w-[16ch] text-[clamp(2.4rem,6vw,4.4rem)] leading-[1.05]">
            {dictionary.notFound.title}
          </h1>
          <p className="max-w-[58ch] text-foreground-muted">{dictionary.notFound.description}</p>
          <Link
            href={`/${defaultLocale}`}
            className="inline-flex items-center rounded-flat bg-gorse px-12 py-7 font-medium text-foreground-on-dark hover:bg-gorse-hover"
          >
            {dictionary.notFound.backHome}
          </Link>
        </main>
        <SiteFooter dictionary={dictionary} />
      </body>
    </html>
  );
}
