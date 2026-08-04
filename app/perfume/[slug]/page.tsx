import type { Metadata } from "next";
import { PerfumePage } from "@/features/library";
import { getPerfumeBySlug } from "@/features/library/lib/queries";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const perfume = await getPerfumeBySlug(slug);
  const title = perfume
    ? `${perfume.displayName} — NO.23`
    : `Perfume — NO.23`;

  return {
    title,
    description: perfume?.officialName,
    alternates: {
      canonical: `/perfume/${slug}`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  return <PerfumePage slug={slug} />;
}
