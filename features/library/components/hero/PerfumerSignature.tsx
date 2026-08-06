import Image from "next/image";
import type { PerfumerPresentation } from "../../lib/presentation";

type PerfumerSignatureProps = {
  perfumer?: PerfumerPresentation | null;
  year?: number | null;
  commercialStatus?: string | null;
};

/**
 * Catalogue colophon — portrait, credit, name, and metadata as one unit.
 */
export function PerfumerSignature({
  perfumer,
  year,
  commercialStatus,
}: PerfumerSignatureProps) {
  if (!perfumer?.name && year == null && !commercialStatus) return null;

  const credit = perfumer?.creditLabel ?? "Creado por";
  const metaParts = [
    year != null ? String(year) : null,
    commercialStatus ?? null,
  ].filter(Boolean);

  return (
    <aside className="perfumer-signature">
      {perfumer?.portraitSrc ? (
        <div className="perfumer-signature__portrait">
          <Image
            src={perfumer.portraitSrc}
            alt=""
            width={112}
            height={112}
            sizes="72px"
          />
        </div>
      ) : null}
      <div className="perfumer-signature__text">
        {perfumer?.name ? (
          <>
            <span className="perfumer-signature__credit">{credit}</span>
            <strong className="perfumer-signature__name">{perfumer.name}</strong>
          </>
        ) : null}
        {metaParts.length ? (
          <p className="perfumer-signature__meta">
            {metaParts.join(" · ")}
          </p>
        ) : null}
      </div>
    </aside>
  );
}
