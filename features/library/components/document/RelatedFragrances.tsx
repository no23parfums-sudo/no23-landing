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
        {related.map((item) => {
          const body = (
            <>
              <span className="related-fragrances__name">{item.name}</span>
              {item.concentration ? (
                <span className="related-fragrances__meta">
                  {item.concentration}
                </span>
              ) : null}
            </>
          );
          return (
            <li key={item.slug}>
              {item.href ? (
                <Link href={item.href} className="related-fragrances__link">
                  {body}
                </Link>
              ) : (
                <div className="related-fragrances__static">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
