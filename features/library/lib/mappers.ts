import type { Enums } from "@/shared/lib/supabase";
import type { PerfumeDetail, PerfumeListItem, PerfumeRow } from "./types";

/** ODD catalog display names for CommercialStatus */
const COMMERCIAL_STATUS_LABEL: Record<
  Enums<"commercial_status">,
  string
> = {
  active: "Activo",
  discontinued: "Discontinuado",
  limited: "Limitado",
  upcoming: "Próximo",
  unknown: "Desconocido",
};

export function toPerfumeListItem(row: PerfumeRow): PerfumeListItem {
  return {
    id: row.id,
    slug: row.slug,
    displayName: row.display_name,
    officialName: row.official_name,
    commercialConcentrationLabel: row.commercial_concentration_label,
    commercialStatusLabel: COMMERCIAL_STATUS_LABEL[row.commercial_status] ?? null,
  };
}

export function toPerfumeDetail(row: PerfumeRow): PerfumeDetail {
  return {
    ...toPerfumeListItem(row),
    launchYear: row.launch_year,
    summary: row.summary,
    officialDescription: row.official_description,
    no23Editorial: row.no23_editorial,
    declaredGender: row.declared_gender,
  };
}
