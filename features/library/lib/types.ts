import type { Enums, Tables } from "@/shared/lib/supabase";

export type PerfumeRow = Tables<"perfumes">;

/** Public list card — only fields safe to surface from ODD pilot data. */
export type PerfumeListItem = {
  id: string;
  slug: string;
  displayName: string;
  officialName: string;
  commercialConcentrationLabel: string | null;
  commercialStatusLabel: string | null;
};

/** Public detail — same visible fields; enrichment stays null until ODD-confirmed. */
export type PerfumeDetail = PerfumeListItem & {
  launchYear: number | null;
  summary: string | null;
  officialDescription: string | null;
  no23Editorial: string | null;
  declaredGender: Enums<"declared_gender"> | null;
};
