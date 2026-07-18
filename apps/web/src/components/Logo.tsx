import styles from "./Logo.module.css";

interface LogoProps {
  size?: "nav" | "footer";
}

/** Silhouette de toit de longère (DESIGN.md §5), utilisée dans SiteNav et SiteFooter. */
export function Logo({ size = "nav" }: LogoProps) {
  return (
    <span
      className={`${styles.logo} ${size === "footer" ? styles.footer : ""}`}
      aria-hidden="true"
    />
  );
}
