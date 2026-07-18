import type { Dictionary } from "@/i18n/dictionaries";
import { Logo } from "./Logo";

export function SiteFooter({ dictionary }: { dictionary: Dictionary }) {
  return (
    <footer className="mt-auto flex items-center gap-8 bg-surface-dark px-[var(--pad-nav-x)] py-12 font-display font-semibold text-foreground-on-dark">
      <Logo size="footer" />
      <span>{dictionary.nav.siteTitle}</span>
    </footer>
  );
}
