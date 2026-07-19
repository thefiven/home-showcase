"use client";

import { useEffect, useRef, useState } from "react";
import { heroScrollStyle } from "@/lib/heroScroll";

export function HeroScrollFade({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState({ opacity: 1, translateY: 0 });

  useEffect(() => {
    const section = ref.current?.closest("section");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const update = () => {
      frame = 0;
      const heroHeight = section?.getBoundingClientRect().height ?? window.innerHeight;
      setStyle(heroScrollStyle(window.scrollY, heroHeight, reducedMotion));
    };

    const onScrollOrResize = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        opacity: style.opacity,
        transform: `translateY(-${style.translateY}px)`,
        pointerEvents: style.opacity === 0 ? "none" : undefined,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </div>
  );
}
