interface LogoProps {
  size?: "nav" | "footer";
}

const CLIP_PATH =
  "[clip-path:polygon(0_100%,_0_55%,_22%_20%,_50%_0%,_78%_20%,_100%_55%,_100%_100%)]";

/** Longère (long farmhouse) roof silhouette (DESIGN.md §5), used in SiteNav and SiteFooter. */
export function Logo({ size = "nav" }: LogoProps) {
  const dimensions = size === "footer" ? "w-[26px] h-[20px]" : "w-[34px] h-[26px]";
  return (
    <span
      className={`inline-block shrink-0 bg-surface-dark ${CLIP_PATH} ${dimensions}`}
      aria-hidden="true"
    />
  );
}
