import Link from "next/link";
import type { PerfumePresentation } from "../../lib/presentation";
import { SectionHeading } from "./SectionHeading";

type RelatedFragrancesProps = {
  related?: PerfumePresentation["related"];
};

/** Curated recommendations — no scores, no percentages. */
export function RelatedFragrances({ related }: RelatedFragrancesProps) {
  if (!related?.length) return null;

  return (
    <section
      className="archive-section related-fragrances"
      aria-labelledby="related-title"
    >
      <SectionHeading
        id="related-title"
        eyebrow="Afinidades"
        title="Si te gusta esta fragancia"
        lede="Lecturas cercanas, curadas — no calculadas."
      />
      <ul className="related-fragrances__list">
        {related.map((item) => (
          <li key={item.slug}>
            <Link href={item.href} className="related-fragrances__link">
              <span className="related-fragrances__name">{item.name}</span>
              {item.concentration ? (
                <span className="related-fragrances__meta">
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
