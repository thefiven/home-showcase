import Link from "next/link";
import { getDictionary } from "@/i18n/dictionaries";
import { defaultLocale } from "@/i18n/config";

/**
 * `not-found.tsx` does not receive the route's `params`: the locale is
 * not known with certainty (e.g. a segment after the locale prefix with
 * no match), so we fall back to `defaultLocale` rather than crashing.
 */
export default function NotFound() {
  const dictionary = getDictionary(defaultLocale);

  return (
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
  );
}
