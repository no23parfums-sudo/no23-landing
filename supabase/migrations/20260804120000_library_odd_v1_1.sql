-- NO.23 Library Foundation — Milestone 1
-- Source of truth: docs/library/odd-v1.1/NO23_ODD_v1.1.md (ODD v1.1)
--
-- Implements only what ODD v1.1 explicitly defines:
--   - Controlled catalogs (02_Catalogos) + Perfume-allowed enums
--   - Perfume scalar fields (01_Diccionario)
--   - Identity stubs for related entities named by Perfume relations
--     (Brand, PrivateCollection, Collection, Line, Concentration, Perfumer)
--     Stub = id only until ODD defines their fields (see odd-v1.1/README.md)
--   - Junction tables implied by Perfume M2M fields
--   - Sources structure (04_Fuentes headers)
--   - Multimedia structure (05_Multimedia headers)
--
-- Does NOT invent schemas for PerfumeNoteObservation, PerfumeFamilySummary,
-- PerfumeAccordSummary, OlfactiveDescriptor, PerfumeContext,
-- PerfumePerformanceSummary — those entities are referenced but not field-defined.

-- ---------------------------------------------------------------------------
-- Enums from 02_Catalogos (codes = Código)
-- ---------------------------------------------------------------------------

CREATE TYPE public.nature AS ENUM (
  'objective',
  'editorial',
  'calculated'
);

CREATE TYPE public.verification_status AS ENUM (
  'unverified',
  'partially_verified',
  'verified',
  'disputed'
);

CREATE TYPE public.commercial_status AS ENUM (
  'active',
  'discontinued',
  'limited',
  'upcoming',
  'unknown'
);

CREATE TYPE public.confidence AS ENUM (
  'very_low',
  'low',
  'medium',
  'high',
  'very_high'
);

CREATE TYPE public.note_position AS ENUM (
  'top',
  'heart',
  'base',
  'unclassified',
  'throughout',
  'unknown'
);

-- Perfume allowed values (01_Diccionario) — codes derived from ODD labels
CREATE TYPE public.perfume_universe AS ENUM (
  'designer',      -- Diseñador
  'niche',         -- Nicho
  'arabic',        -- Árabe
  'indie',         -- Indie
  'celebrity',     -- Celebrity
  'inspiration'    -- Inspiración
);

CREATE TYPE public.declared_gender AS ENUM (
  'masculine',     -- Masculino
  'feminine',      -- Femenino
  'unisex',        -- Unisex
  'unspecified'    -- No especificado
);

CREATE TYPE public.completeness_level AS ENUM (
  'minimum',       -- Minimum
  'standard',      -- Standard
  'enriched',      -- Enriched
  'editorial'      -- Editorial
);

-- ---------------------------------------------------------------------------
-- Catalog reference rows (02_Catalogos) for display metadata
-- ---------------------------------------------------------------------------

CREATE TABLE public.catalog_entries (
  catalog text NOT NULL,
  code text NOT NULL,
  display_name text NOT NULL,
  description text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  PRIMARY KEY (catalog, code)
);

COMMENT ON TABLE public.catalog_entries IS
  'ODD v1.1 sheet 02_Catalogos — controlled vocabulary metadata.';

INSERT INTO public.catalog_entries (catalog, code, display_name, description, is_active, sort_order) VALUES
  ('Nature', 'objective', 'Objetivo', 'Dato factual o documental.', true, 1),
  ('Nature', 'editorial', 'Editorial NO.23', 'Evaluación o interpretación propia.', true, 2),
  ('Nature', 'calculated', 'Calculado', 'Resultado derivado por el sistema.', true, 3),
  ('VerificationStatus', 'unverified', 'No verificado', NULL, true, 1),
  ('VerificationStatus', 'partially_verified', 'Parcialmente verificado', NULL, true, 2),
  ('VerificationStatus', 'verified', 'Verificado', NULL, true, 3),
  ('VerificationStatus', 'disputed', 'Disputado', NULL, true, 4),
  ('CommercialStatus', 'active', 'Activo', NULL, true, 1),
  ('CommercialStatus', 'discontinued', 'Discontinuado', NULL, true, 2),
  ('CommercialStatus', 'limited', 'Limitado', NULL, true, 3),
  ('CommercialStatus', 'upcoming', 'Próximo', NULL, true, 4),
  ('CommercialStatus', 'unknown', 'Desconocido', NULL, true, 5),
  ('Confidence', 'very_low', 'Muy baja', NULL, true, 1),
  ('Confidence', 'low', 'Baja', NULL, true, 2),
  ('Confidence', 'medium', 'Media', NULL, true, 3),
  ('Confidence', 'high', 'Alta', NULL, true, 4),
  ('Confidence', 'very_high', 'Muy alta', NULL, true, 5),
  ('NotePosition', 'top', 'Salida', NULL, true, 1),
  ('NotePosition', 'heart', 'Corazón', NULL, true, 2),
  ('NotePosition', 'base', 'Fondo', NULL, true, 3),
  ('NotePosition', 'unclassified', 'Sin posición declarada', NULL, true, 4),
  ('NotePosition', 'throughout', 'Durante toda la evolución', NULL, true, 5),
  ('NotePosition', 'unknown', 'Posición desconocida', NULL, true, 6),
  ('PerfumeUniverse', 'designer', 'Diseñador', NULL, true, 1),
  ('PerfumeUniverse', 'niche', 'Nicho', NULL, true, 2),
  ('PerfumeUniverse', 'arabic', 'Árabe', NULL, true, 3),
  ('PerfumeUniverse', 'indie', 'Indie', NULL, true, 4),
  ('PerfumeUniverse', 'celebrity', 'Celebrity', NULL, true, 5),
  ('PerfumeUniverse', 'inspiration', 'Inspiración', NULL, true, 6),
  ('DeclaredGender', 'masculine', 'Masculino', NULL, true, 1),
  ('DeclaredGender', 'feminine', 'Femenino', NULL, true, 2),
  ('DeclaredGender', 'unisex', 'Unisex', NULL, true, 3),
  ('DeclaredGender', 'unspecified', 'No especificado', NULL, true, 4),
  ('CompletenessLevel', 'minimum', 'Minimum', NULL, true, 1),
  ('CompletenessLevel', 'standard', 'Standard', NULL, true, 2),
  ('CompletenessLevel', 'enriched', 'Enriched', NULL, true, 3),
  ('CompletenessLevel', 'editorial', 'Editorial', NULL, true, 4);

-- ---------------------------------------------------------------------------
-- Related-entity identity stubs (ODD names the relation targets; fields TBD)
-- ---------------------------------------------------------------------------

CREATE TABLE public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);
COMMENT ON TABLE public.brands IS
  'ODD relation target Brand — identity stub only; full fields await ODD.';

CREATE TABLE public.private_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);
COMMENT ON TABLE public.private_collections IS
  'ODD relation target PrivateCollection — identity stub only; full fields await ODD.';

CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);
COMMENT ON TABLE public.collections IS
  'ODD relation target Collection — identity stub only; full fields await ODD.';

CREATE TABLE public.lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);
COMMENT ON TABLE public.lines IS
  'ODD relation target Line — identity stub only; full fields await ODD.';

CREATE TABLE public.concentrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);
COMMENT ON TABLE public.concentrations IS
  'ODD relation target Concentration — identity stub only; full fields await ODD.';

CREATE TABLE public.perfumers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);
COMMENT ON TABLE public.perfumers IS
  'ODD relation target Perfumer — identity stub only; full fields await ODD.';

-- ---------------------------------------------------------------------------
-- Perfume (01_Diccionario) — all explicitly defined scalar / enum / FK fields
-- ---------------------------------------------------------------------------

CREATE TABLE public.perfumes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  official_name text NOT NULL,
  display_name text NOT NULL,
  slug text NOT NULL,
  brand_id uuid NOT NULL REFERENCES public.brands (id),
  universe public.perfume_universe,
  private_collection_id uuid REFERENCES public.private_collections (id),
  line_id uuid REFERENCES public.lines (id),
  launch_year integer,
  concentration_id uuid REFERENCES public.concentrations (id),
  commercial_concentration_label text,
  declared_gender public.declared_gender,
  summary text,
  official_description text,
  no23_editorial text,
  commercial_status public.commercial_status NOT NULL,
  verification_status public.verification_status NOT NULL,
  completeness_level public.completeness_level NOT NULL,
  CONSTRAINT perfumes_slug_unique UNIQUE (slug),
  CONSTRAINT perfumes_official_name_not_blank CHECK (length(trim(official_name)) > 0),
  CONSTRAINT perfumes_display_name_not_blank CHECK (length(trim(display_name)) > 0),
  CONSTRAINT perfumes_slug_format CHECK (slug = lower(slug) AND slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  CONSTRAINT perfumes_launch_year_range CHECK (
    launch_year IS NULL
    OR (launch_year >= 1900 AND launch_year <= (EXTRACT(YEAR FROM CURRENT_DATE)::integer + 1))
  )
);

COMMENT ON TABLE public.perfumes IS
  'ODD v1.1 Perfume entity — physical columns match 01_Diccionario field list.';

COMMENT ON COLUMN public.perfumes.official_name IS 'ODD: official_name — Objetivo / Público';
COMMENT ON COLUMN public.perfumes.display_name IS 'ODD: display_name — Editorial controlado / Público';
COMMENT ON COLUMN public.perfumes.slug IS 'ODD: slug — Sistema / Interno/URL';
COMMENT ON COLUMN public.perfumes.brand_id IS 'ODD: brand_id → Brand';
COMMENT ON COLUMN public.perfumes.universe IS 'ODD: universe — Editorial NO.23';
COMMENT ON COLUMN public.perfumes.private_collection_id IS 'ODD: private_collection_id → PrivateCollection';
COMMENT ON COLUMN public.perfumes.line_id IS 'ODD: line_id → Line';
COMMENT ON COLUMN public.perfumes.launch_year IS 'ODD: launch_year — Objetivo';
COMMENT ON COLUMN public.perfumes.concentration_id IS 'ODD: concentration_id → Concentration';
COMMENT ON COLUMN public.perfumes.commercial_concentration_label IS 'ODD: commercial_concentration_label — Objetivo';
COMMENT ON COLUMN public.perfumes.declared_gender IS 'ODD: declared_gender — Objetivo';
COMMENT ON COLUMN public.perfumes.summary IS 'ODD: summary — Editorial NO.23';
COMMENT ON COLUMN public.perfumes.official_description IS 'ODD: official_description — Objetivo';
COMMENT ON COLUMN public.perfumes.no23_editorial IS 'ODD: no23_editorial — Editorial NO.23';
COMMENT ON COLUMN public.perfumes.commercial_status IS 'ODD: commercial_status — Objetivo';
COMMENT ON COLUMN public.perfumes.verification_status IS 'ODD: verification_status — Sistema / Interno';
COMMENT ON COLUMN public.perfumes.completeness_level IS 'ODD: completeness_level — Calculado / Interno';

CREATE INDEX perfumes_brand_id_idx ON public.perfumes (brand_id);
CREATE INDEX perfumes_line_id_idx ON public.perfumes (line_id);
CREATE INDEX perfumes_concentration_id_idx ON public.perfumes (concentration_id);

-- M2M: collection_ids (ODD) — one may be marked primary
CREATE TABLE public.perfume_collections (
  perfume_id uuid NOT NULL REFERENCES public.perfumes (id) ON DELETE CASCADE,
  collection_id uuid NOT NULL REFERENCES public.collections (id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT false,
  PRIMARY KEY (perfume_id, collection_id)
);

COMMENT ON TABLE public.perfume_collections IS
  'ODD Perfume.collection_ids — many-to-many; is_primary marks the principal collection.';

CREATE UNIQUE INDEX perfume_collections_one_primary_per_perfume
  ON public.perfume_collections (perfume_id)
  WHERE is_primary;

-- M2M: perfumer_ids (ODD)
CREATE TABLE public.perfume_perfumers (
  perfume_id uuid NOT NULL REFERENCES public.perfumes (id) ON DELETE CASCADE,
  perfumer_id uuid NOT NULL REFERENCES public.perfumers (id) ON DELETE CASCADE,
  PRIMARY KEY (perfume_id, perfumer_id)
);

COMMENT ON TABLE public.perfume_perfumers IS
  'ODD Perfume.perfumer_ids — many-to-many.';

-- ---------------------------------------------------------------------------
-- Sources (04_Fuentes column headers) — types mapped conservatively from labels
-- ---------------------------------------------------------------------------

CREATE TABLE public.sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text,
  title text,
  publisher text,
  author text,
  url text,
  published_on date,
  consulted_on date,
  entity text,
  field_or_relation text,
  value_snapshot text,
  evidence_role text,
  confidence public.confidence,
  notes text
);

COMMENT ON TABLE public.sources IS
  'ODD v1.1 sheet 04_Fuentes — columns map 1:1 to sheet headers; related-entity join rules await ODD.';

-- ---------------------------------------------------------------------------
-- Media assets (05_Multimedia column headers)
-- ---------------------------------------------------------------------------

CREATE TABLE public.media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity text,
  role text,
  file_or_url text,
  type text,
  source text,
  rights text,
  approval text,
  alt_text text,
  is_primary boolean NOT NULL DEFAULT false,
  notes text
);

COMMENT ON TABLE public.media_assets IS
  'ODD v1.1 sheet 05_Multimedia — columns map 1:1 to sheet headers; related-entity join rules await ODD.';
