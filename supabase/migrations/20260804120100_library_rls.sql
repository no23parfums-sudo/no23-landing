-- RLS for ODD v1.1 library foundation tables.
-- ODD does not define an is_published flag; anon read is allowed for public library
-- tables so the app can query. Writes remain locked to service role / authenticated
-- policies to be refined when ODD defines a publish gate.

ALTER TABLE public.catalog_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.private_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concentrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfumers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfume_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfume_perfumers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY catalog_entries_select_anon
  ON public.catalog_entries FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY brands_select_anon
  ON public.brands FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY private_collections_select_anon
  ON public.private_collections FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY collections_select_anon
  ON public.collections FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY lines_select_anon
  ON public.lines FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY concentrations_select_anon
  ON public.concentrations FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY perfumers_select_anon
  ON public.perfumers FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY perfumes_select_anon
  ON public.perfumes FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY perfume_collections_select_anon
  ON public.perfume_collections FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY perfume_perfumers_select_anon
  ON public.perfume_perfumers FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY sources_select_anon
  ON public.sources FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY media_assets_select_anon
  ON public.media_assets FOR SELECT TO anon, authenticated
  USING (true);
