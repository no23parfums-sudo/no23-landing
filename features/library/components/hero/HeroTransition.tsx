"use client";

import {
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

type HeroTransitionProps = {
  children: (api: {
    pinRef: RefObject<HTMLElement | null>;
    entered: boolean;
  }) => ReactNode;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function writeTokens(
  shell: HTMLElement | null,
  values: {
    progress: number;
    photo: number;
    ui: number;
    doc: number;
    depthBg: string;
    depthUi: string;
  },
) {
  if (!shell) return;
  shell.style.setProperty("--hero-progress", values.progress.toFixed(4));
  shell.style.setProperty("--hero-photo-fade", values.photo.toFixed(4));
  shell.style.setProperty("--hero-ui-fade", values.ui.toFixed(4));
  shell.style.setProperty("--hero-doc-rise", values.doc.toFixed(4));
  shell.style.setProperty("--hero-depth-bg", values.depthBg);
  shell.style.setProperty("--hero-depth-ui", values.depthUi);
}

function clearTokens(shell: HTMLElement | null) {
  writeTokens(shell, {
    progress: 0,
    photo: 0,
    ui: 0,
    doc: 0,
    depthBg: "0vh",
    depthUi: "0vh",
  });
}

/**
 * Owns short cinematic scroll travel and writes layered handoff tokens
 * onto the perfume shell. Native scroll only — no jacking, snap, or springs.
 *
 * Tokens:
 * --hero-progress     overall 0→1 travel
 * --hero-depth-bg     photographic parallax (subtle)
 * --hero-depth-ui     interface depth (slower / smaller)
 * --hero-photo-fade   delayed photographic recession
 * --hero-ui-fade      later interface fade
 * --hero-doc-rise     ivory editorial plane rising as a sheet
 */
export function HeroTransition({ children }: HeroTransitionProps) {
  const pinRef = useRef<HTMLElement>(null);
  const [entered, setEntered] = useState(false);
  const reduceMotion = useReducedMotion();
  const reduceMotionRef = useRef(reduceMotion);
  const shellRef = useRef<HTMLElement | null>(null);
  reduceMotionRef.current = reduceMotion;

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const applyProgress = (p: number) => {
    if (!shellRef.current) {
      shellRef.current = document.querySelector<HTMLElement>(
        "[data-perfume-shell]",
      );
    }
    const shell = shellRef.current;
    if (reduceMotionRef.current) {
      clearTokens(shell);
      return;
    }

    const progress = clamp01(p);

    /* Phase 1 — hold: depth only, almost no fade */
    const depthBg = `${(-progress * 2.2).toFixed(3)}vh`;
    const depthUi = `${(-progress * 0.55).toFixed(3)}vh`;

    /* Phase 2 — separation: photo recesses before UI */
    const photo = clamp01((progress - 0.3) / 0.58);
    const ui = clamp01((progress - 0.46) / 0.44);

    /* Phase 3 — editorial plane: physical sheet from below */
    const docRaw = clamp01((progress - 0.12) / 0.78);
    /* Soft ease — edge arrives early enough to read as a sheet */
    const doc = Math.pow(docRaw, 0.92);

    writeTokens(shell, {
      progress,
      photo,
      ui,
      doc,
      depthBg,
      depthUi,
    });
  };

  useMotionValueEvent(scrollYProgress, "change", applyProgress);

  useEffect(() => {
    shellRef.current = document.querySelector<HTMLElement>("[data-perfume-shell]");
    applyProgress(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync once after mount / reduced-motion flip
  }, [reduceMotion, scrollYProgress]);

  return <>{children({ pinRef, entered })}</>;
}
