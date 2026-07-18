import type { Dictionary } from "@/i18n/dictionaries";
import { Logo } from "./Logo";
import styles from "./SiteFooter.module.css";

export function SiteFooter({ dictionary }: { dictionary: Dictionary }) {
  return (
    <footer className={styles.footer}>
      <Logo size="footer" />
      <span>{dictionary.nav.siteTitle}</span>
    </footer>
  );
}
