import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { locales, resolveLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { SiteNav } from "@/components/SiteNav";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
  const dictionary = getDictionary(resolveLocale(rawLocale));
  return {
    title: dictionary.nav.siteTitle,
    description: dictionary.home.description,
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
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <SiteNav locale={locale} dictionary={dictionary} />
        {children}
      </body>
    </html>
  );
}
