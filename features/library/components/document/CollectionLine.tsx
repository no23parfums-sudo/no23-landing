import Link from "next/link";
import type { PerfumePresentation } from "../../lib/presentation";
import { SectionHeading } from "./SectionHeading";

type CollectionLineProps = {
  collection?: PerfumePresentation["collection"];
};

/** Fragrance family / line — concentrations as an archive index. */
export function CollectionLine({ collection }: CollectionLineProps) {
  if (!collection?.members?.length) return null;

  return (
    <section
      className="archive-section collection-line"
      aria-labelledby="collection-title"
    >
      <SectionHeading
        id="collection-title"
        eyebrow="Colección"
        title={collection.title ?? "La línea"}
      />
      <ul className="collection-line__list">
        {collection.members.map((member) => (
          <li key={member.slug}>
            {member.current || !member.href ? (
              <span
                className={
                  member.current
                    ? "collection-line__item collection-line__item--current"
                    : "collection-line__item"
                }
                aria-current={member.current ? "page" : undefined}
              >
                <span className="collection-line__name">{member.name}</span>
                {member.concentration ? (
                  <span className="collection-line__meta">
                    {member.concentration}
                  </span>
                ) : null}
              </span>
            ) : (
              <Link href={member.href} className="collection-line__item">
                <span className="collection-line__name">{member.name}</span>
                {member.concentration ? (
                  <span className="collection-line__meta">
                    {member.concentration}
                  </span>
                ) : null}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
