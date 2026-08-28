"use client";

import { useEffect } from "react";

/**
 * Bibliothèque-only Lenis — copied from bibliotheque-enchantee.
 * Must not change shared/lib/lenis/config.ts (perfume freeze).
 * Global SmoothScroll skips /bibliotheque so the two engines never overlap.
 */
export function useBibliothequeScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let lenis: { raf: (t: number) => void; destroy: () => void } | null = null;
    let cancelled = false;

    void import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const instance = new Lenis({
        duration: 1.5,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        lerp: 0.085,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.4,
      });
      lenis = instance as unknown as {
        raf: (t: number) => void;
        destroy: () => void;
      };
      const loop = (time: number) => {
        instance.raf(time);
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lenis?.destroy();
    };
  }, []);
}
