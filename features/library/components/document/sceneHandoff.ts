"use client";

import type { Variants } from "motion/react";
import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * Viewport-entry editorial assembly.
 *
 * Transferred from the Ex Nihilo audit: compositions already exist in layout;
 * pieces reveal with short opacity + small translateY, staggered.
 * Reverse to hidden is instant (used only when Firma re-arms off-screen).
 */
export const editorialEase = [0.22, 1, 0.36, 1] as const;

/** Start as the chapter begins to enter — not after it already fills the view. */
export const editorialViewport = {
  once: true,
  amount: 0.12,
  margin: "0px 0px -12% 0px",
} as const;

/** Línea Bleu starts establishing while Performance is still handing off. */
export const lineageViewport = {
  once: true,
  amount: 0.08,
  margin: "0px 0px 22% 0px",
} as const;

export function photoAssemble(
  delay: number,
  y: number,
  scale = 1,
  duration = 0.68,
): Variants {
  return {
    hidden: { opacity: 0, y, scale, transition: { duration: 0 } },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration, ease: editorialEase, delay },
    },
  };
}

/** Photographic uncover: opacity + Y + scale + a single top crop. */
export function photoUncover(
  delay: number,
  y: number,
  scale: number,
  clipTopPct: number,
  duration: number,
): Variants {
  return {
    hidden: {
      opacity: 0,
      y,
      scale,
      clipPath: `inset(${clipTopPct}% 0% 0% 0%)`,
      transition: { duration: 0 },
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      clipPath: "inset(0% 0% 0% 0%)",
      transition: { duration, ease: editorialEase, delay },
    },
  };
}

export function copyAssemble(delay: number, y = 8, duration = 0.5): Variants {
  return {
    hidden: { opacity: 0, y, transition: { duration: 0 } },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration, ease: editorialEase, delay },
    },
  };
}

export function plateAssemble(delay = 0): Variants {
  return {
    hidden: {
      opacity: 0,
      y: 32,
      scale: 0.992,
      transition: { duration: 0 },
    },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.7, ease: editorialEase, delay },
    },
  };
}

export function hairlineAssemble(delay = 0.08): Variants {
  return {
    hidden: { scaleX: 0, transition: { duration: 0 } },
    show: {
      scaleX: 1,
      transition: { duration: 0.62, ease: editorialEase, delay },
    },
  };
}

type RevealPhase = "armed" | "settled";

/**
 * Firma collage cycle:
 *   ARMED → (enters from Hero) → SETTLED
 *   SETTLED stays through Architecture / Performance / Línea Bleu
 *   re-ARM only when Hero is back at rest (Firma fully below the fold)
 *
 * `hero.top <= N` is true while scrolling down (top goes negative). The
 * floor `hero.top >= -0.04vh` is what stops seam reversals from replaying.
 */
export function useHeroArmedReveal(
  sectionRef: RefObject<HTMLElement | null>,
  reduceMotion: boolean,
) {
  const [phase, setPhase] = useState<RevealPhase>("armed");
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  useEffect(() => {
    if (reduceMotion) return;

    const section = sectionRef.current;
    const hero = document.querySelector<HTMLElement>(".perfume-hero-scroll");
    if (!section || !hero) return;

    let ticking = false;

    const measure = () => {
      ticking = false;
      const vh = window.innerHeight;
      const heroRect = hero.getBoundingClientRect();
      const firmaRect = section.getBoundingClientRect();
      const heroOwnsStage =
        heroRect.top >= -vh * 0.04 &&
        heroRect.top <= vh * 0.08 &&
        heroRect.bottom >= vh * 0.96;
      const firmaBelowFold = firmaRect.top >= vh;

      if (heroOwnsStage && firmaBelowFold) {
        if (phaseRef.current !== "armed") setPhase("armed");
        return;
      }

      if (phaseRef.current === "armed" && firmaRect.top < vh * 0.88) {
        setPhase("settled");
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [reduceMotion, sectionRef]);

  return reduceMotion || phase === "settled";
}
