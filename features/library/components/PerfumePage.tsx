import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LibraryShell } from "./LibraryShell";
import { PerfumeDetailView } from "./PerfumeDetailView";
import { getPerfumeBySlug } from "../lib/queries";
import { resolvePerfumePresentation } from "../lib/presentation";

type PerfumePageProps = {
  slug: string;
};

export async function PerfumePage({ slug }: PerfumePageProps) {
  const perfume = await getPerfumeBySlug(slug);
  if (!perfume) notFound();

  const presentation = resolvePerfumePresentation(
    perfume.slug,
    perfume.displayName,
  );

  return (
    <LibraryShell mode="perfume" atmosphere={presentation.atmosphere}>
      <Suspense>
        <PerfumeDetailView perfume={perfume} />
      </Suspense>
    </LibraryShell>
  );
}
