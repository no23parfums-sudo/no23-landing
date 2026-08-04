import { TextLink } from "@/shared/ui";
import type { PerfumeDetail } from "../lib/types";

type PerfumeDetailViewProps = {
  perfume: PerfumeDetail;
};

function Fact({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="perfume-fact">
      <span className="mini-label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function PerfumeDetailView({ perfume }: PerfumeDetailViewProps) {
  return (
    <article className="perfume-detail">
      <p className="eyebrow">Ficha piloto</p>
      <h1>{perfume.displayName}</h1>
      <p className="perfume-official">{perfume.officialName}</p>

      <div className="perfume-facts">
        <Fact label="Concentración" value={perfume.commercialConcentrationLabel} />
        <Fact label="Estado comercial" value={perfume.commercialStatusLabel} />
        <Fact label="Año" value={perfume.launchYear} />
      </div>

      {perfume.summary ? (
        <p className="perfume-summary">{perfume.summary}</p>
      ) : null}

      {perfume.officialDescription ? (
        <div className="perfume-block">
          <span className="mini-label">Descripción oficial</span>
          <p>{perfume.officialDescription}</p>
        </div>
      ) : null}

      {perfume.no23Editorial ? (
        <div className="perfume-block">
          <span className="mini-label">Editorial NO.23</span>
          <p>{perfume.no23Editorial}</p>
        </div>
      ) : null}

      <div className="perfume-actions">
        <TextLink href="/biblioteca">Volver a la biblioteca</TextLink>
      </div>
    </article>
  );
}
