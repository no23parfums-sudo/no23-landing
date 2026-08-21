/**
 * Page/route-lifetime discovery memory.
 * Reloading the perfume route resets. No session/local persistence.
 */

export type DiscoveryState = "unseen" | "discovering" | "settled";
export type SmokeDiscovery = "unseen" | "cinematic-played" | "visited";

type VisitMemory = {
  performance: DiscoveryState;
  /** First discovery used the long reading hold; revisit uses a short hold. */
  performanceReleaseSeen: boolean;
  smoke: SmokeDiscovery;
  /** True only after Signature Notes has fully owned the viewport this visit. */
  signatureNotesReached: boolean;
  /**
   * Forward Film A is armed on load and after a genuine Hero rest.
   * Cleared when Signature is reached so upward return skips Film.
   */
  forwardFilmReady: boolean;
  /** Criterio signature clip-reveal spent for this document traversal. */
  criterioSignatureSeen: boolean;
};

const visits = new Map<string, VisitMemory>();

function key() {
  return typeof window === "undefined" ? "" : window.location.pathname;
}

function memory(): VisitMemory {
  const k = key();
  let visit = visits.get(k);
  if (!visit) {
    visit = {
      performance: "unseen",
      performanceReleaseSeen: false,
      smoke: "unseen",
      signatureNotesReached: false,
      forwardFilmReady: true,
      criterioSignatureSeen: false,
    };
    visits.set(k, visit);
  }
  return visit;
}

export function getPerformanceDiscovery(): DiscoveryState {
  return memory().performance;
}

export function getSmokeDiscovery(): SmokeDiscovery {
  return memory().smoke;
}

export function markPerformanceDiscovering(): void {
  const visit = memory();
  if (visit.performance === "unseen") visit.performance = "discovering";
}

export function markPerformanceSettled(): void {
  memory().performance = "settled";
}

/** Test / soft-nav helper — full reload also clears via new module instance. */
export function resetDiscoveryForPath(pathname?: string): void {
  const k = pathname ?? key();
  visits.delete(k);
  if (typeof document !== "undefined") {
    delete document.documentElement.dataset.smokeVisit;
  }
}

if (typeof window !== "undefined") {
  /* QA / soft-nav helper — not part of product UI. */
  (
    window as Window & { __no23ResetDiscovery?: typeof resetDiscoveryForPath }
  ).__no23ResetDiscovery = resetDiscoveryForPath;
}

export function markSmokePlayed(): void {
  const visit = memory();
  if (visit.smoke === "unseen") visit.smoke = "cinematic-played";
}

export function markSmokeVisited(): void {
  /* Crossing Smoke (either direction) collapses revisit geometry. */
  memory().smoke = "visited";
}

export function isPerformanceSettled(): boolean {
  return memory().performance === "settled";
}

/** True after the first Performance → Section 06 release completed this visit. */
export function hasSeenPerformanceRelease(): boolean {
  return memory().performanceReleaseSeen;
}

export function markPerformanceReleaseSeen(): void {
  memory().performanceReleaseSeen = true;
}

/** Signature Notes has fully arrived — Hero/Film A intro is spent for this visit. */
export function hasReachedSignatureNotes(): boolean {
  return memory().signatureNotesReached;
}

export function markSignatureNotesReached(): void {
  const visit = memory();
  visit.signatureNotesReached = true;
  /* Next upward pass skips Film until Hero rest re-arms forward. */
  visit.forwardFilmReady = false;
}

export function isForwardFilmReady(): boolean {
  return memory().forwardFilmReady;
}

export function hasCriterioSignatureBeenSeen(): boolean {
  return memory().criterioSignatureSeen;
}

export function markCriterioSignatureSeen(): void {
  memory().criterioSignatureSeen = true;
}

/** Call only when static Hero fully owns the resting pin. */
export function rearmForwardFilm(): void {
  if (memory().signatureNotesReached) memory().forwardFilmReady = true;
}

export function isSmokeVisited(): boolean {
  return memory().smoke === "visited";
}

/** Scroll velocity that reads as navigation, not discovery. */
export const NAV_VELOCITY = 2000;

export function isNavigating(velocityPxPerSec: number, jumped: boolean) {
  return jumped || Math.abs(velocityPxPerSec) >= NAV_VELOCITY;
}
