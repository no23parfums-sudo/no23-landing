"use client";

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

/**
 * Owns the cinematic scroll pin and writes --hero-progress onto the perfume shell.
 * Layout stays in CSS; this only measures travel.
 */
export function HeroTransition({ children }: HeroTransitionProps) {
  const pinRef = useRef<HTMLElement>(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const pin = pinRef.current;
    if (!pin) return;

    const shell = document.querySelector<HTMLElement>("[data-perfume-shell]");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const measure = () => {
      if (reduced.matches) {
        shell?.style.setProperty("--hero-progress", "0");
        return;
      }

      const total = pin.offsetHeight - window.innerHeight;
      const top = pin.getBoundingClientRect().top;
      const next = total <= 0 ? 0 : Math.min(1, Math.max(0, -top / total));
      shell?.style.setProperty("--hero-progress", next.toFixed(4));
    };

    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return <>{children({ pinRef, entered })}</>;
}
