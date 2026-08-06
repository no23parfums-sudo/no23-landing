import type { PerfumeDetail } from "../lib/types";
import { resolvePerfumePresentation } from "../lib/presentation";
import { PerfumeDocument } from "./document";
import { PerfumeHero } from "./hero";

type PerfumeDetailViewProps = {
  perfume: PerfumeDetail;
};

export function PerfumeDetailView({ perfume }: PerfumeDetailViewProps) {
  const presentation = resolvePerfumePresentation(
    perfume.slug,
    perfume.displayName,
  );

  const year = perfume.launchYear ?? presentation.yearFallback ?? null;

  return (
    <>
      <PerfumeHero
        presentation={presentation}
        concentration={perfume.commercialConcentrationLabel}
        year={year}
        commercialStatus={perfume.commercialStatusLabel}
      />
      <PerfumeDocument presentation={presentation} />
    </>
  );
}
