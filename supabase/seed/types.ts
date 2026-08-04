/**
 * Generic library seed document shape aligned with ODD v1.1 Perfume fields.
 * Pilot files (PILOT_PERFUME_1…5) are data only — no perfume-specific code paths.
 */

import type { TablesInsert } from "../../shared/lib/supabase/database.types";

export type PilotPerfumeSeedDocument = {
  /** Stable pilot slot label, e.g. PILOT_PERFUME_1 */
  pilot_slot: string;
  /** Optional fixed UUIDs so re-seeds stay idempotent */
  ids?: {
    brand_id?: string;
    private_collection_id?: string;
    line_id?: string;
    concentration_id?: string;
    perfume_id?: string;
    collection_ids?: string[];
    perfumer_ids?: string[];
  };
  perfume: Omit<TablesInsert<"perfumes">, "brand_id"> & {
    brand_id?: string;
  };
  /** Create brand stub row if brand_id not supplied */
  ensure_brand?: boolean;
  ensure_line?: boolean;
  ensure_concentration?: boolean;
  ensure_private_collection?: boolean;
  collection_links?: Array<{
    collection_id?: string;
    is_primary?: boolean;
  }>;
  perfumer_links?: Array<{
    perfumer_id?: string;
  }>;
};

export type SeedManifest = {
  version: "1";
  description?: string;
  /** Paths relative to supabase/seed/data/ */
  documents: string[];
};
