import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { resolveLocale } from "@/i18n/config";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function Home({ params }: HomePageProps) {
  const { locale: rawLocale } = await params;
  const locale = resolveLocale(rawLocale);
  const dictionary = getDictionary(locale);

  return (
    <main className="mx-auto flex max-w-[1200px] flex-col items-start gap-8 px-[var(--pad-nav-x)] py-[var(--pad-section)]">
      <h1 className="max-w-[16ch] text-[clamp(2.4rem,6vw,4.4rem)] leading-[1.05]">
        {dictionary.home.title}
      </h1>
      <p className="max-w-[58ch] text-foreground-muted">{dictionary.home.description}</p>
      <Link
        href={`/${locale}/properties`}
        className="inline-flex items-center rounded-flat bg-gorse px-12 py-7 font-medium text-foreground-on-dark hover:bg-gorse-hover"
      >
        {dictionary.home.cta}
      </Link>
    </main>
  );
}
