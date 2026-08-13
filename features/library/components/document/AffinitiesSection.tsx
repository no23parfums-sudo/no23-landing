"use client";

import Link from "next/link";
import type { AffinityPresentation } from "../../lib/presentation";

type AffinitiesSectionProps = {
  affinities?: AffinityPresentation;
};

/**
 * Affinities outside the same line.
 * Hidden when no curated items — never invents recommendations.
 */
export function AffinitiesSection({ affinities }: AffinitiesSectionProps) {
  if (!affinities?.items?.length) return null;

  const { eyebrow = "Afinidades", title, lede, items } = affinities;

  return (
    <section
      className="affinities-section"
      aria-labelledby="affinities-title"
    >
      <header className="affinities-section__masthead">
        <p className="affinities-section__eyebrow">{eyebrow}</p>
        <h2 id="affinities-title" className="affinities-section__title">
          {title}
        </h2>
        {lede ? <p className="affinities-section__lede">{lede}</p> : null}
      </header>
      <ul className="affinities-section__list" role="list">
        {items.map((item) => (
          <li key={item.slug} className="affinities-section__item">
            <Link href={item.href} className="affinities-section__link">
              <span className="affinities-section__name">{item.name}</span>
              {item.concentration ? (
                <span className="affinities-section__conc">
                  {item.concentration}
                </span>
              ) : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
