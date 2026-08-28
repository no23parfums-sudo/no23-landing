"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  LENIS_OPTIONS,
  persistLenisToggle,
  prefersReducedMotion,
  readLenisToggle,
  setLenisSessionOverride,
} from "./config";

function pageOwnsLenis(pathname: string) {
  return pathname === "/bibliotheque" || pathname.startsWith("/bibliotheque/");
}

gsap.registerPlugin(ScrollTrigger);

declare global {
  interface Window {
    __NO23_LENIS?: Lenis;
    __NO23_LENIS_DEBUG?: {
      enable: () => void;
      disable: () => void;
      instance: () => Lenis | undefined;
    };
  }
}

/**
 * Global Lenis experiment. Attaches to the window scroller (no fake container).
 * Renders nothing. Safe to leave mounted when Lenis is toggled off.
 */
export function SmoothScroll() {
  const pathname = usePathname();
  const ownedByPage = pageOwnsLenis(pathname);

  useEffect(() => {
    if (ownedByPage) {
      document.documentElement.dataset.lenis = "off";
      document.documentElement.dataset.lenisOwner = "page";
      return;
    }

    delete document.documentElement.dataset.lenisOwner;

    let lenis: Lenis | undefined;
    let reducedMq: MediaQueryList | undefined;

    const mark = (on: boolean) => {
      document.documentElement.dataset.lenis = on ? "on" : "off";
    };

    const stop = () => {
      if (!lenis) {
        mark(false);
        return;
      }
      lenis.off("scroll", ScrollTrigger.update);
      lenis.destroy();
      lenis = undefined;
      delete window.__NO23_LENIS;
      mark(false);
      ScrollTrigger.refresh();
    };

    const start = () => {
      if (lenis || prefersReducedMotion() || !readLenisToggle()) {
        mark(false);
        return;
      }

      lenis = new Lenis({ ...LENIS_OPTIONS });
      window.__NO23_LENIS = lenis;
      lenis.on("scroll", ScrollTrigger.update);
      mark(true);
    };

    const sync = () => {
      const want =
        readLenisToggle() && !prefersReducedMotion();
      if (want) start();
      else stop();
    };

    sync();

    reducedMq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onReduced = () => sync();
    reducedMq.addEventListener("change", onReduced);

    window.__NO23_LENIS_DEBUG = {
      enable: () => {
        setLenisSessionOverride(true);
        persistLenisToggle(true);
        sync();
      },
      disable: () => {
        setLenisSessionOverride(false);
        persistLenisToggle(false);
        stop();
      },
      instance: () => lenis,
    };

    return () => {
      reducedMq?.removeEventListener("change", onReduced);
      delete window.__NO23_LENIS_DEBUG;
      stop();
    };
  }, [ownedByPage]);

  return null;
}
