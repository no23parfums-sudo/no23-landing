import Link from "next/link";
import { TextLink } from "@/shared/ui";
import type { PerfumeListItem } from "../lib/types";

type PerfumeListProps = {
  items: PerfumeListItem[];
};

export function PerfumeList({ items }: PerfumeListProps) {
  if (items.length === 0) {
    return (
      <div className="library-empty">
        <p>
          La biblioteca aún no tiene fichas publicadas. El piloto Bleu de Chanel
          EDP está preparado en seed y se cargará cuando las migraciones estén
          aplicadas.
        </p>
        <TextLink href="/">Volver al inicio</TextLink>
      </div>
    );
  }

  return (
    <ul className="library-list">
      {items.map((item) => (
        <li key={item.id}>
          <Link className="library-list-item" href={`/perfume/${item.slug}`}>
            <span className="library-list-name">{item.displayName}</span>
            <span className="library-list-meta">
              {[item.commercialConcentrationLabel, item.commercialStatusLabel]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
