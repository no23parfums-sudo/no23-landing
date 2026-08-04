-- Data API privileges for library tables.
-- Supabase cloud no longer auto-exposes new public tables to API roles.
-- RLS policies remain the access control; these GRANTs enable the API roles
-- to reach the tables. No table/column structure changes.

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

GRANT SELECT ON TABLE
  public.catalog_entries,
  public.brands,
  public.private_collections,
  public.collections,
  public.lines,
  public.concentrations,
  public.perfumers,
  public.perfumes,
  public.perfume_collections,
  public.perfume_perfumers,
  public.sources,
  public.media_assets
TO anon, authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE
  public.catalog_entries,
  public.brands,
  public.private_collections,
  public.collections,
  public.lines,
  public.concentrations,
  public.perfumers,
  public.perfumes,
  public.perfume_collections,
  public.perfume_perfumers,
  public.sources,
  public.media_assets
TO service_role;
