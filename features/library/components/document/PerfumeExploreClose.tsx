"use client";

import Link from "next/link";

/** Existing library entry — do not invent a destination. */
export const PERFUME_EXPLORE_HREF = "/biblioteca";

/**
 * Compact editorial close of the perfume fiche.
 * Whole banner is the link. No video.
 */
export function ExploreBibliothequeBanner() {
  return (
    <Link
      href={PERFUME_EXPLORE_HREF}
      className="explore-biblio"
      aria-label="Bibliothèque NO.23"
    >
      <span className="explore-biblio__field">
        <span className="explore-biblio__copy">
          <span className="explore-biblio__kicker">Continuar descubriendo</span>
          <span className="explore-biblio__title">Bibliothèque NO.23</span>
        </span>
        <span className="explore-biblio__go" aria-hidden="true">
          <span className="explore-biblio__arrow">→</span>
        </span>
      </span>
    </Link>
  );
}

/** @deprecated Use ExploreBibliothequeBanner */
export function PerfumeExploreClose() {
  return <ExploreBibliothequeBanner />;
}
