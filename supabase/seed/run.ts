/**
 * Generic ODD seed runner — loads perfume documents from supabase/seed/data
 * via manifest.json. No perfume-specific branching.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... npm run seed:library
 */

import { createClient } from "@supabase/supabase-js";
import { readFile, access } from "node:fs/promises";
import path from "node:path";
import type { Database } from "../../shared/lib/supabase/database.types";
import type {
  PilotPerfumeSeedDocument,
  SeedManifest,
} from "./types";

const root = path.join(process.cwd(), "supabase", "seed");

async function loadJson<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function ensureId(
  client: ReturnType<typeof createClient<Database>>,
  table:
    | "brands"
    | "private_collections"
    | "collections"
    | "lines"
    | "concentrations"
    | "perfumers",
  id?: string,
): Promise<string> {
  if (id) {
    const { error } = await client.from(table).upsert({ id });
    if (error) throw error;
    return id;
  }
  const { data, error } = await client.from(table).insert({}).select("id").single();
  if (error) throw error;
  return data.id;
}

async function seedDocument(
  client: ReturnType<typeof createClient<Database>>,
  doc: PilotPerfumeSeedDocument,
) {
  const brandId = await ensureId(
    client,
    "brands",
    doc.ids?.brand_id ?? doc.perfume.brand_id,
  );

  let privateCollectionId = doc.ids?.private_collection_id
    ?? doc.perfume.private_collection_id
    ?? null;
  if (doc.ensure_private_collection || privateCollectionId) {
    privateCollectionId = await ensureId(
      client,
      "private_collections",
      privateCollectionId ?? undefined,
    );
  }

  let lineId = doc.ids?.line_id ?? doc.perfume.line_id ?? null;
  if (doc.ensure_line || lineId) {
    lineId = await ensureId(client, "lines", lineId ?? undefined);
  }

  let concentrationId =
    doc.ids?.concentration_id ?? doc.perfume.concentration_id ?? null;
  if (doc.ensure_concentration || concentrationId) {
    concentrationId = await ensureId(
      client,
      "concentrations",
      concentrationId ?? undefined,
    );
  }

  const perfumePayload = {
    ...doc.perfume,
    id: doc.ids?.perfume_id ?? doc.perfume.id,
    brand_id: brandId,
    private_collection_id: privateCollectionId,
    line_id: lineId,
    concentration_id: concentrationId,
  };

  const { data: perfume, error: perfumeError } = await client
    .from("perfumes")
    .upsert(perfumePayload, { onConflict: "slug" })
    .select("id")
    .single();

  if (perfumeError) throw perfumeError;

  for (const link of doc.collection_links ?? []) {
    const collectionId = await ensureId(
      client,
      "collections",
      link.collection_id,
    );
    const { error } = await client.from("perfume_collections").upsert({
      perfume_id: perfume.id,
      collection_id: collectionId,
      is_primary: link.is_primary ?? false,
    });
    if (error) throw error;
  }

  for (const link of doc.perfumer_links ?? []) {
    const perfumerId = await ensureId(client, "perfumers", link.perfumer_id);
    const { error } = await client.from("perfume_perfumers").upsert({
      perfume_id: perfume.id,
      perfumer_id: perfumerId,
    });
    if (error) throw error;
  }

  console.log(`Seeded pilot slot ${doc.pilot_slot} → perfume ${perfume.id}`);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required to seed",
    );
  }

  const manifest = await loadJson<SeedManifest>(
    path.join(root, "manifest.json"),
  );

  if (manifest.documents.length === 0) {
    console.log("Seed manifest has no documents. Nothing to load.");
    return;
  }

  const client = createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  for (const relative of manifest.documents) {
    const filePath = path.join(root, "data", relative);
    await access(filePath);
    const doc = await loadJson<PilotPerfumeSeedDocument>(filePath);
    await seedDocument(client, doc);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
