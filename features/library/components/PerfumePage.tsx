import { notFound } from "next/navigation";
import { LibraryShell } from "./LibraryShell";
import { PerfumeDetailView } from "./PerfumeDetailView";
import { getPerfumeBySlug } from "../lib/queries";

type PerfumePageProps = {
  slug: string;
};

export async function PerfumePage({ slug }: PerfumePageProps) {
  const perfume = await getPerfumeBySlug(slug);
  if (!perfume) notFound();

  return (
    <LibraryShell>
      <PerfumeDetailView perfume={perfume} />
    </LibraryShell>
  );
}
