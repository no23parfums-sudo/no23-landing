import { createClient } from "@/shared/lib/supabase/server";
import { toPerfumeDetail, toPerfumeListItem } from "./mappers";
import type { PerfumeDetail, PerfumeListItem } from "./types";

function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

/**
 * Public library listing. Returns [] when Supabase env is missing
 * (migrations/seed not yet applied) so builds and empty previews stay safe.
 */
export async function listPerfumes(): Promise<PerfumeListItem[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfumes")
    .select("*")
    .order("display_name", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(toPerfumeListItem);
}

export async function getPerfumeBySlug(
  slug: string,
): Promise<PerfumeDetail | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("perfumes")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? toPerfumeDetail(data) : null;
}
