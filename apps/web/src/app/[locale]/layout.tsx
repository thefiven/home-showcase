import type { Metadata } from "next";
import { Source_Serif_4, Work_Sans, Space_Mono } from "next/font/google";
import { locales, resolveLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SiteNav } from "@/components/SiteNav";
import { SiteFooter } from "@/components/SiteFooter";
import { resolveSiteUrl, localizedAlternates } from "@/lib/site";
import "../globals.css";

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

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const dictionary = getDictionary(locale);
  return {
    metadataBase: new URL(resolveSiteUrl()),
    title: dictionary.nav.siteTitle,
    description: dictionary.home.description,
    alternates: localizedAlternates(locale, ""),
    openGraph: {
      title: dictionary.nav.siteTitle,
      description: dictionary.home.description,
      type: "website",
    },
  };
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const dictionary = getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable}`}
    >
      <body>
        <SiteNav locale={locale} dictionary={dictionary} />
        {children}
        <SiteFooter dictionary={dictionary} />
      </body>
    </html>
  );
}
