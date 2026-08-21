import type { LenisOptions } from "lenis";

/**
 * NO.23 Lenis experiment — single calibration point.
 *
 * Toggle (priority: debug session → URL → localStorage → this flag):
 *   - This file: LENIS_ENABLED
 *   - URL:       ?lenis=0  |  ?lenis=1
 *   - Storage:   localStorage["no23:lenis"] = "0" | "1"
 *   - Devtools:  window.__NO23_LENIS_DEBUG.enable() / disable()
 *
 * Runtime (devtools):
 *   window.__NO23_LENIS_DEBUG.enable()
 *   window.__NO23_LENIS_DEBUG.disable()
 *
 * Native scroll is restored when disabled or when prefers-reduced-motion is on.
 * Do not change these values from other files — calibrate here only.
 */
export const LENIS_ENABLED = true;

export const LENIS_STORAGE_KEY = "no23:lenis";

/** Session override from window.__NO23_LENIS_DEBUG — wins over URL for live A/B. */
let sessionOverride: boolean | null = null;

export function setLenisSessionOverride(on: boolean | null) {
  sessionOverride = on;
}

/** Conservative inertial smoothing. Higher lerp = snappier / closer to 1:1. */
export const LENIS_OPTIONS = {
  /** Omit wrapper — Lenis defaults to window (native scrollbar + sticky). */
  autoRaf: true,
  autoResize: true,
  /** 0.16: between Ex Nihilo 0.14 and prior 0.18. Editorial density. */
  lerp: 0.16,
  smoothWheel: true,
  /** Native touch momentum. Do not enable syncTouch (feels like hijacking). */
  syncTouch: false,
  wheelMultiplier: 1,
  touchMultiplier: 1,
  orientation: "vertical",
  gestureOrientation: "vertical",
  infinite: false,
  overscroll: true,
  /** Hash / review anchors keep working through Lenis. */
  anchors: true,
  stopInertiaOnNavigate: true,
  /** Belt-and-suspenders; we also skip creating Lenis under reduced motion. */
  respectReducedMotion: true,
} satisfies LenisOptions;

export function readLenisToggle(): boolean {
  if (typeof window === "undefined") return LENIS_ENABLED;
  if (sessionOverride != null) return sessionOverride;

  const query = new URLSearchParams(window.location.search).get("lenis");
  if (query === "0" || query === "off" || query === "false") return false;
  if (query === "1" || query === "on" || query === "true") return true;

  try {
    const stored = window.localStorage.getItem(LENIS_STORAGE_KEY);
    if (stored === "0" || stored === "off") return false;
    if (stored === "1" || stored === "on") return true;
  } catch {
    /* private mode */
  }

  return LENIS_ENABLED;
}

export function persistLenisToggle(on: boolean) {
  try {
    window.localStorage.setItem(LENIS_STORAGE_KEY, on ? "1" : "0");
  } catch {
    /* private mode */
  }
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
