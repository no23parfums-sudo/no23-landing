/**
 * Page/route-lifetime discovery memory.
 * Reloading the perfume route resets. No session/local persistence.
 */

export type DiscoveryState = "unseen" | "discovering" | "settled";
export type SmokeDiscovery = "unseen" | "cinematic-played" | "visited";

type VisitMemory = {
  performance: DiscoveryState;
  smoke: SmokeDiscovery;
};

const visits = new Map<string, VisitMemory>();

function key() {
  return typeof window === "undefined" ? "" : window.location.pathname;
}

function memory(): VisitMemory {
  const k = key();
  let visit = visits.get(k);
  if (!visit) {
    visit = { performance: "unseen", smoke: "unseen" };
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

export function isSmokeVisited(): boolean {
  return memory().smoke === "visited";
}

/** Scroll velocity that reads as navigation, not discovery. */
export const NAV_VELOCITY = 2000;

export function isNavigating(velocityPxPerSec: number, jumped: boolean) {
  return jumped || Math.abs(velocityPxPerSec) >= NAV_VELOCITY;
}
