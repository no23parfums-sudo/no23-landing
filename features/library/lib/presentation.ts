import type { AtmosphereId } from "./atmosphere";
import { DEFAULT_ATMOSPHERE } from "./atmosphere";

/* —— Shared editorial atoms —— */

/**
 * Normalized still-life annotation + explore hotspot (percent of frame, 0–100).
 * Anchor must sit on the visible ingredient; label is placed separately.
 * Hotspot is the invisible hit-target for COMPOSICIÓN exploration.
 */
export type NoteMapAnchor = {
  /** Dot position on the ingredient */
  anchorX: number;
  anchorY: number;
  /** Label position */
  labelX: number;
  labelY: number;
  /** Label text alignment relative to labelX */
  align?: "left" | "right";
  /** Invisible explore hotspot center (defaults to anchor) */
  hotspotX?: number;
  hotspotY?: number;
  /** Hotspot size — larger than the ingredient for effortless hit */
  hotspotW?: number;
  hotspotH?: number;
  /** @deprecated Prefer anchorX — kept for older records */
  x?: number;
  /** @deprecated Prefer anchorY */
  y?: number;
  /** @deprecated Prefer align */
  side?: "left" | "right";
};

export type NoteEntry = {
  /** Stable id for explore/hotspot state (defaults to slugified name) */
  id?: string;
  name: string;
  /** Ingredient photograph — optional until the media library is complete */
  imageSrc?: string;
  slug?: string;
  /**
   * Position on the olfactive still-life map (percent of frame).
   * Used only when architecture.stillLifeSrc is present.
   */
  map?: NoteMapAnchor;
};

/**
 * Soft elliptical region for Chapter 03 photographic emphasis.
 * Percent of the still-life frame — perfume-specific, never inferred.
 */
export type ArchitectureHighlight = {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
};

export type NoteStageId = "top" | "heart" | "base";

export type NoteStage = {
  id: NoteStageId | string;
  label: string;
  /** Short sensory reading for architecture annotations */
  reading?: string;
  /**
   * Quiet facet line for the architecture panel
   * (e.g. "Fresco · Cítrico · Aromático") — optional per perfume.
   */
  traits?: string;
  /** Optional still-life emphasis regions for this phase */
  highlights?: ArchitectureHighlight[];
  notes: NoteEntry[];
};

/**
 * Editorial highlight for Signature Notes (Chapter 02).
 * Exactly three per fragrance when complete: top, heart, base.
 *
 * Selection rule (objective, not aesthetic):
 * - Salida  = most representative opening note
 * - Corazón = most representative heart note
 * - Fondo   = most representative base note
 * Must match the first note of the corresponding architecture stage.
 * Full stage inventories remain in architecture (Chapter 03).
 */
export type SignatureNote = {
  stage: NoteStageId;
  label: string;
  note: NoteEntry;
  editorialLine?: string;
  /** Quiet companion taxonomy — never compete with the principal */
  secondaryNotes?: string[];
  /** object-position for the specimen plate, e.g. "50% 40%" */
  imageFocus?: string;
};

/** Optional Chapter 02 masthead overrides (template defaults apply otherwise). */
export type NotesChapterPresentation = {
  /** Quiet chapter index, e.g. "02" */
  index?: string;
  eyebrow?: string;
  title?: string;
  lede?: string;
  /**
   * When true, chapter intro is revealed on the Hero dark atmosphere.
   * The document must not repeat the headline / lede.
   */
  revealInHero?: boolean;
};

export type PerfumerPresentation = {
  name: string;
  portraitSrc?: string;
  creditLabel?: string;
  /** Short quote for architecture insight — optional */
  quote?: string;
};

export type ContinuumReading = {
  reading: string;
  /** Normalized 0–1 for rendering — never shown as a percentage */
  position?: number;
  /** Qualitative rail poles, e.g. ["Corta", "Larga"] */
  poles?: [string, string];
  /** Short marker under the settled node, e.g. "Prolongada" */
  marker?: string;
};

export type SpectrumReading = {
  reading: string;
  spectrum: string[];
  active: string[];
  /** Normalized 0–1 per spectrum item — never shown as a percentage */
  weights?: number[];
};

export type PerformancePresentation = {
  longevity?: ContinuumReading;
  sillage?: ContinuumReading;
  projection?: ContinuumReading;
  versatility?: ContinuumReading & {
    poles?: [string, string];
  };
  seasons?: SpectrumReading;
  occasions?: SpectrumReading;
  /**
   * Internal research notes for editorial metrics.
   * Not user-facing as a source attribution of the bars.
   */
  researchBasis?: string[];
};

export type RelatedFragrance = {
  slug: string;
  name: string;
  concentration?: string;
  href: string;
};

/** Chronological family line — scalable across fragrances. */
export type LineageEntry = {
  id: string;
  year: number | string;
  name: string;
  concentration: string;
  imageSrc: string;
  /** Short editorial reading — one line */
  reading: string;
  /** Current page fragrance */
  current?: boolean;
  /** Optional link when that perfume page exists — omit rather than fake */
  href?: string;
  /** Optional creator credit for this concentration */
  perfumer?: string;
  /** Optional portrait — omit when unavailable; never empty placeholder */
  perfumerPortraitSrc?: string;
};

export type LineagePresentation = {
  index?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  entries: LineageEntry[];
};

/** Future affinity recommendations — outside the same line. */
export type AffinityPresentation = {
  eyebrow?: string;
  title: string;
  lede?: string;
  items: RelatedFragrance[];
};

/** Conditional commerce bridge — render Shop CTA only when available. */
export type CommercePresentation = {
  available: boolean;
  productUrl?: string;
  label?: string;
};

export type CollectionMember = {
  slug: string;
  name: string;
  concentration?: string;
  shortConcentration?: string;
  href?: string;
  current?: boolean;
  /** Hero atmosphere plate for this concentration (family swap) */
  editorialSrc?: string;
  /** object-position hint for this plate, e.g. "50% 48%" */
  heroFocus?: string;
  /** Left-rail taxonomic descriptor (not a brand slogan) */
  descriptor?: string;
  /** Concise NO.23 editorial summary grounded in maison composition */
  editorialSummary?: string;
  /** Verified creator credit for this concentration */
  perfumer?: string;
  /** Verified launch year for this concentration — omit if unverified */
  year?: number;
  /** Verified olfactive family / character for this concentration */
  olfactiveFamily?: string;
  /** Concentration-specific catalog index, e.g. "N° 23 — 002" */
  catalogRef?: string;
  /**
   * EDP-only: cinematic bottle film that replaces the static Firma media layer.
   * Other concentrations must omit this — never inherit cross-slug.
   */
  firmaFilmSrc?: string;
};

export type MoodboardPlate = {
  id: string;
  imageSrc: string;
  /** Layout role in the collage system */
  role: "lead" | "support" | "texture" | "detail";
  caption?: string;
  /** object-position hint, e.g. "50% 40%" */
  focus?: string;
};

export type MoodboardPresentation = {
  eyebrow?: string;
  title: string;
  lede?: string;
  swatches: { id: string; hex: string; label?: string }[];
  plates: MoodboardPlate[];
};

export type HistoryEvent = {
  id: string;
  year: string;
  label: string;
  body: string;
  href?: string;
  imageSrc?: string;
};

export type HistoryPresentation = {
  eyebrow?: string;
  title: string;
  lede?: string;
  events: HistoryEvent[];
};

/** Complete-map state copy for the architecture panel (04 COMPOSICIÓN). */
export type ArchitectureComposition = {
  /** Short editorial line — how the three movements connect */
  reading: string;
  /** Optional compact taxonomy, e.g. "Salida · Corazón · Fondo" */
  taxonomy?: string;
};

export type ArchitecturePresentation = {
  /** Quiet page-chapter index for the architecture section, e.g. "04" */
  index?: string;
  eyebrow?: string;
  title?: string;
  lede?: string;
  /**
   * Interactive still-life for the olfactive map.
   * When absent, the interactive map does not render for that slug.
   */
  stillLifeSrc?: string;
  stillLifeAlt?: string;
  /**
   * Full-bleed Section 3 atmospheric plate (under still-life + panel).
   * Distinct from stillLifeSrc — never baked with product/UI.
   */
  sectionBackgroundSrc?: string;
  stages: NoteStage[];
  /** Optional fourth-state (COMPOSICIÓN) panel copy */
  composition?: ArchitectureComposition;
  /**
   * EDP-only Architecture → Smoke cinema config.
   * Absent = no cinematic stage for that slug.
   */
  cinematic?: {
    smokeFilmSrc: string;
    /** Hidden bridge frame during geometry swap (seconds) */
    bridgeTime?: number;
  };
};

/**
 * Full presentation contract for the permanent fragrance template.
 * Components consume this shape — never fragrance-specific JSX.
 */
export type PerfumePresentation = {
  atmosphere: AtmosphereId;
  heroName: string;
  heroTitleLines?: string[];
  brandName: string;
  brandLogoSrc?: string;
  editorialSrc?: string;
  bottleSrc?: string;
  archivalCaption?: string;
  yearFallback?: number;
  /** Quiet catalogue reference, e.g. "Nº 23 — 001" */
  catalogRef?: string;
  /** Optional editorial tagline under the title */
  heroTagline?: string;
  /** Verified olfactive family for this variant */
  olfactiveFamily?: string;
  /** Country / origin label */
  origin?: string;
  perfumer?: PerfumerPresentation;

  signatureNotes?: SignatureNote[];
  notesChapter?: NotesChapterPresentation;

  architecture?: ArchitecturePresentation;

  /**
   * @deprecated Use architecture. Kept temporarily for migration.
   */
  pyramid?: ArchitecturePresentation;

  moodboard?: MoodboardPresentation;
  history?: HistoryPresentation;
  /** Chronological line / family chapter (replaces duplicated History + Collection) */
  lineage?: LineagePresentation;
  performance?: PerformancePresentation;

  related?: RelatedFragrance[];
  /** Affinities outside the same line — omit or empty to hide section */
  affinities?: AffinityPresentation;

  collection?: {
    title?: string;
    members: CollectionMember[];
  };

  variants?: CollectionMember[];

  /** Conditional NO.23 Shop — never show CTA when available is false/missing */
  commerce?: CommercePresentation;
};

const PRESENTATIONS: Record<string, PerfumePresentation> = {
  "bleu-de-chanel-eau-de-parfum": {
    atmosphere: "nocturne",
    heroName: "Bleu de Chanel",
    heroTitleLines: ["Bleu de", "Chanel"],
    brandName: "Chanel",
    brandLogoSrc: "/media/brands/chanel/logo-black.png",
    editorialSrc:
      "/media/perfumes/bleu-de-chanel-edp/edp/bleu-edp-hero-final.png",
    bottleSrc:
      "/media/perfumes/bleu-de-chanel-edp/linea/bleu-edp-linea.png",
    catalogRef: "N° 23 — 002",
    /** Page-level fallbacks — Hero prefers active variant fields */
    yearFallback: 2014,
    olfactiveFamily: "Aromático · Amaderado",
    origin: "Francia",
    perfumer: {
      name: "Jacques Polge",
      portraitSrc: "/media/perfumers/jacques-polge/portrait.jpeg",
      creditLabel: "Creado por",
      quote:
        "Quise expresar una libertad contemporánea: fresca al inicio, más densa y amaderada con el tiempo.",
    },
    notesChapter: {
      index: "02",
      eyebrow: "Notas Signatura",
      title: "La firma olfativa",
      revealInHero: true,
      lede:
        "Frescura aromática y profundidad amaderada conviven en una composición más sensual: el pomelo aporta luz, el jengibre tensión especiada y el incienso una sombra seca sobre el fondo cálido de la fragancia.",
    },
    signatureNotes: [
      {
        stage: "top",
        label: "Salida",
        note: {
          name: "Pomelo",
          imageSrc: "/media/notes/grapefruit/editorial.jpg",
        },
        editorialLine: "Una salida cítrica, amarga y luminosa.",
        imageFocus: "50% 42%",
        secondaryNotes: [
          "Limón",
          "Menta",
          "Bergamota",
          "Pimienta rosa",
          "Aldehídos",
          "Coriandro",
        ],
      },
      {
        stage: "heart",
        label: "Corazón",
        note: {
          name: "Jengibre",
          imageSrc: "/media/notes/ginger/editorial.jpg",
        },
        editorialLine: "Un corazón especiado, seco y vibrante.",
        imageFocus: "50% 45%",
        secondaryNotes: ["Jazmín", "Nuez moscada", "Melón"],
      },
      {
        stage: "base",
        label: "Fondo",
        note: {
          name: "Incienso",
          imageSrc: "/media/notes/incense/editorial.jpg",
        },
        editorialLine: "Un fondo ahumado, profundo y elegante.",
        imageFocus: "50% 40%",
        secondaryNotes: [
          "Ámbar",
          "Cedro",
          "Sándalo",
          "Amberwood",
          "Pachulí",
          "Ládano",
        ],
      },
    ],
    performance: {
      researchBasis: [
        "Chanel official (aromatic-woody EDP; ambery/musky woods; New Caledonian sandalwood; Jacques Polge, 2014)",
        "Fragrantica community (Bleu de Chanel EDP, 2014; ~22k ratings; 4.42/5; year-round office/all-occasion comments; arm's-length then closer projection)",
        "Parfumo community (8.2/10 scent, ~5.6k ratings; ~7.35/10 longevity, ~7.15/10 sillage — qualitative classification only)",
      ],
      longevity: {
        reading: "Del mediodía al anochecer",
        position: 0.74,
        poles: ["Corta", "Larga"],
        marker: "Prolongada",
      },
      projection: {
        reading: "Presencia moderada",
        position: 0.56,
        poles: ["Piel", "Amplia"],
        marker: "Moderada",
      },
      sillage: {
        reading: "Estela moderada",
        position: 0.58,
        poles: ["Contenida", "Marcada"],
        marker: "Moderada",
      },
      seasons: {
        reading: "Todas las estaciones, con más presencia en climas frescos",
        spectrum: ["Primavera", "Verano", "Otoño", "Invierno"],
        active: ["Primavera", "Verano", "Otoño", "Invierno"],
        weights: [0.82, 0.52, 0.92, 0.82],
      },
      occasions: {
        reading: "Del escritorio a la noche",
        spectrum: ["Día", "Trabajo", "Noche", "Formal"],
        active: ["Día", "Trabajo", "Noche", "Formal"],
        weights: [0.86, 0.92, 0.88, 0.82],
      },
      versatility: {
        reading: "Amplia",
        position: 0.82,
        poles: ["Especializada", "Muy versátil"],
        marker: "Amplia",
      },
    },
    /**
     * Olfactory architecture map (EDP only) — bound to edp-notes-section3.png.
     * Anchors on real ingredients; labels use editorial negative space.
     * Salida: rail fades — labels sit in the left gutter (align left).
     */
    architecture: {
      index: "04",
      eyebrow: "Arquitectura Olfativa",
      title: "",
      stillLifeSrc:
        "/media/perfumes/bleu-de-chanel-edp/edp/edp-notes-section3.png",
      stillLifeAlt:
        "Naturaleza muerta olfativa de Bleu de Chanel Eau de Parfum",
      sectionBackgroundSrc:
        "/media/perfumes/bleu-de-chanel-edp/edp/edp-section3-fondo.png",
      cinematic: {
        smokeFilmSrc:
          "/media/perfumes/bleu-de-chanel-edp/edp/bleu-edp-cinematic-smoke.mp4",
        bridgeTime: 7.5,
      },
      composition: {
        reading:
          "Tres movimientos de una sola composición: la luz cítrica abre, el jengibre tensiona el centro y el incienso fija la sombra sobre maderas y resinas.",
        taxonomy: "Salida · Corazón · Fondo",
      },
      stages: [
        {
          id: "top",
          label: "Salida",
          reading: "La apertura cítrica y el frescor que firma Pomelo.",
          traits: "Fresco · Cítrico · Aromático",
          highlights: [
            { cx: 20, cy: 48, rx: 26, ry: 38 },
            { cx: 14, cy: 20, rx: 14, ry: 16 },
            { cx: 27, cy: 44, rx: 12, ry: 18 },
            { cx: 16, cy: 86, rx: 12, ry: 10 },
          ],
          notes: [
            {
              id: "aldehidos",
              name: "Aldehídos",
              map: {
                /* Silver molecular model — upper-left atmosphere */
                anchorX: 17,
                anchorY: 20,
                labelX: 8,
                labelY: 12,
                align: "left",
                hotspotX: 17,
                hotspotY: 20,
                hotspotW: 14,
                hotspotH: 16,
              },
            },
            {
              id: "menta",
              name: "Menta",
              map: {
                /* Mint leaf cluster left of bottle */
                anchorX: 16,
                anchorY: 44,
                labelX: 4,
                labelY: 32,
                align: "left",
                hotspotX: 17,
                hotspotY: 44,
                hotspotW: 13,
                hotspotH: 14,
              },
            },
            {
              id: "bergamota",
              name: "Bergamota",
              map: {
                /* Spiraling yellow citrus peel */
                anchorX: 29,
                anchorY: 43,
                labelX: 16,
                labelY: 36,
                align: "left",
                hotspotX: 28,
                hotspotY: 43,
                hotspotW: 12,
                hotspotH: 16,
              },
            },
            {
              id: "limon",
              name: "Limón",
              map: {
                /* Yellow lemon half face */
                anchorX: 21,
                anchorY: 57,
                labelX: 7,
                labelY: 56,
                align: "left",
                hotspotX: 22,
                hotspotY: 57,
                hotspotW: 13,
                hotspotH: 12,
              },
            },
            {
              id: "pomelo",
              name: "Pomelo",
              imageSrc: "/media/notes/grapefruit/editorial.jpg",
              map: {
                /* Pink grapefruit flesh */
                anchorX: 14,
                anchorY: 69,
                labelX: 3,
                labelY: 70,
                align: "left",
                hotspotX: 15,
                hotspotY: 69,
                hotspotW: 14,
                hotspotH: 13,
              },
            },
            {
              id: "pimienta-rosa",
              name: "Pimienta rosa",
              map: {
                /* Pink peppercorn cluster under lemon */
                anchorX: 27,
                anchorY: 68,
                labelX: 8,
                labelY: 84,
                align: "left",
                hotspotX: 27,
                hotspotY: 68,
                hotspotW: 11,
                hotspotH: 10,
              },
            },
            {
              id: "coriandro",
              name: "Coriandro",
              map: {
                /* Tan coriander seed pile — bottom left */
                anchorX: 11,
                anchorY: 79,
                labelX: 5,
                labelY: 96,
                align: "left",
                hotspotX: 11,
                hotspotY: 79,
                hotspotW: 11,
                hotspotH: 9,
              },
            },
          ],
        },
        {
          id: "heart",
          label: "Corazón",
          reading: "La tensión especiada que sostiene Jengibre.",
          traits: "Especiado · Seco · Vibrante",
          highlights: [
            { cx: 78, cy: 42, rx: 20, ry: 22 },
            { cx: 84, cy: 58, rx: 12, ry: 11 },
            { cx: 90, cy: 40, rx: 10, ry: 10 },
          ],
          notes: [
            {
              id: "jengibre",
              name: "Jengibre",
              imageSrc: "/media/notes/ginger/editorial.jpg",
              map: {
                /* Large knobby ginger root — upper right */
                anchorX: 75,
                anchorY: 34,
                labelX: 96,
                labelY: 16,
                align: "right",
                hotspotX: 76,
                hotspotY: 35,
                hotspotW: 17,
                hotspotH: 17,
              },
            },
            {
              id: "melon",
              name: "Melón",
              map: {
                /* Orange cantaloupe wedge — far right */
                anchorX: 90,
                anchorY: 38,
                labelX: 98,
                labelY: 32,
                align: "right",
                hotspotX: 90,
                hotspotY: 38,
                hotspotW: 12,
                hotspotH: 12,
              },
            },
            {
              id: "jazmin",
              name: "Jazmín",
              imageSrc: "/media/notes/jasmine/editorial.jpg",
              map: {
                /* White jasmine blossoms at ginger base */
                anchorX: 81,
                anchorY: 48,
                labelX: 96,
                labelY: 50,
                align: "right",
                hotspotX: 81,
                hotspotY: 48,
                hotspotW: 11,
                hotspotH: 10,
              },
            },
            {
              id: "nuez-moscada",
              name: "Nuez moscada",
              map: {
                /* Whole + halved nutmeg on rock */
                anchorX: 84,
                anchorY: 58,
                labelX: 97,
                labelY: 64,
                align: "right",
                hotspotX: 84,
                hotspotY: 58,
                hotspotW: 13,
                hotspotH: 11,
              },
            },
          ],
        },
        {
          id: "base",
          label: "Fondo",
          reading: "La sombra seca del Incienso sobre maderas y resinas.",
          traits: "Ahumado · Profundo · Elegante",
          highlights: [
            { cx: 50, cy: 70, rx: 14, ry: 20 },
            { cx: 48, cy: 88, rx: 12, ry: 10 },
            { cx: 66, cy: 90, rx: 12, ry: 10 },
            { cx: 82, cy: 84, rx: 16, ry: 14 },
          ],
          notes: [
            {
              id: "incienso",
              name: "Incienso",
              imageSrc: "/media/notes/incense/editorial.jpg",
              map: {
                /* Smoldering incense stick + rising smoke */
                anchorX: 50,
                anchorY: 70,
                labelX: 34,
                labelY: 52,
                align: "left",
                hotspotX: 50,
                hotspotY: 70,
                hotspotW: 10,
                hotspotH: 18,
              },
            },
            {
              id: "ambar",
              name: "Ámbar",
              map: {
                /* Translucent golden amber stones — center foreground */
                anchorX: 45,
                anchorY: 87,
                labelX: 28,
                labelY: 86,
                align: "left",
                hotspotX: 45,
                hotspotY: 87,
                hotspotW: 12,
                hotspotH: 10,
              },
            },
            {
              id: "ladano",
              name: "Ládano",
              map: {
                /* Dark crumbly resin chunk — lower center-right */
                anchorX: 62,
                anchorY: 89,
                labelX: 56,
                labelY: 98,
                align: "left",
                hotspotX: 62,
                hotspotY: 89,
                hotspotW: 12,
                hotspotH: 10,
              },
            },
            {
              id: "cedro",
              name: "Cedro",
              map: {
                /* Dark bark / wood piece left of sandalwood stack */
                anchorX: 72,
                anchorY: 78,
                labelX: 93,
                labelY: 66,
                align: "right",
                hotspotX: 72,
                hotspotY: 78,
                hotspotW: 11,
                hotspotH: 12,
              },
            },
            {
              id: "sandalo",
              name: "Sándalo",
              imageSrc: "/media/notes/sandalwood/editorial.jpg",
              map: {
                /* Stacked rectangular wood sticks — right */
                anchorX: 83,
                anchorY: 74,
                labelX: 96,
                labelY: 72,
                align: "right",
                hotspotX: 83,
                hotspotY: 74,
                hotspotW: 10,
                hotspotH: 10,
              },
            },
            {
              id: "pachuli",
              name: "Pachulí",
              map: {
                /* Single green serrated leaf on woods */
                anchorX: 79,
                anchorY: 86,
                labelX: 95,
                labelY: 86,
                align: "right",
                hotspotX: 79,
                hotspotY: 86,
                hotspotW: 10,
                hotspotH: 9,
              },
            },
            {
              id: "amberwood",
              name: "Amberwood",
              map: {
                /* Pale crystalline resin/wood — far bottom right */
                anchorX: 88,
                anchorY: 91,
                labelX: 98,
                labelY: 97,
                align: "right",
                hotspotX: 88,
                hotspotY: 91,
                hotspotW: 11,
                hotspotH: 10,
              },
            },
          ],
        },
      ],
    },
    lineage: {
      index: "06",
      eyebrow: "LA LÍNEA",
      title: "La línea Bleu",
      subtitle: "Cuatro interpretaciones. Una misma firma.",
      entries: [
        {
          id: "bleu-edt-2010",
          year: 2010,
          name: "Bleu de Chanel",
          concentration: "Eau de Toilette",
          imageSrc:
            "/media/perfumes/bleu-de-chanel-edp/linea/bleu-edt-linea.png",
          reading:
            "La lectura original: luminosa, aromática y amaderada.",
          perfumer: "Jacques Polge",
        },
        {
          id: "bleu-edp-2014",
          year: 2014,
          name: "Bleu de Chanel",
          concentration: "Eau de Parfum",
          imageSrc:
            "/media/perfumes/bleu-de-chanel-edp/linea/bleu-edp-linea.png",
          reading:
            "Una interpretación más cálida, profunda y envolvente.",
          current: true,
          perfumer: "Jacques Polge",
          perfumerPortraitSrc:
            "/media/perfumers/jacques-polge/portrait.jpeg",
        },
        {
          id: "bleu-parfum-2018",
          year: 2018,
          name: "Bleu de Chanel",
          concentration: "Parfum",
          imageSrc:
            "/media/perfumes/bleu-de-chanel-edp/linea/bleu-parfum-linea.png",
          reading:
            "Más densa y refinada, con una firma amaderada más profunda.",
          perfumer: "Olivier Polge",
        },
        {
          id: "bleu-lexclusif-2025",
          year: 2025,
          name: "Bleu de Chanel",
          concentration: "L'Exclusif",
          imageSrc:
            "/media/perfumes/bleu-de-chanel-edp/linea/bleu-lexclusif-linea.png",
          reading:
            "La expresión más intensa y misteriosa de la línea.",
          perfumer: "Olivier Polge",
        },
      ],
    },
    /* Affinities intentionally omitted — same-line EDT/Parfum now live in lineage. */
    commerce: {
      available: true,
      /* productUrl omitted until production shop URL is confirmed */
      label: "AVAILABLE IN NO.23 SHOP",
    },
    variants: [
      {
        slug: "bleu-de-chanel-eau-de-toilette",
        name: "Bleu de Chanel",
        concentration: "Eau de Toilette",
        shortConcentration: "EDT",
        catalogRef: "N° 23 — 001",
        editorialSrc: "/media/perfumes/bleu-de-chanel-edp/bleu-edt-hero-final.png",
        heroFocus: "45% 48%",
        descriptor: "AROMÁTICO · AMADERADO · FRESCO",
        editorialSummary:
          "Cítricos y facetas aromáticas aportan luminosidad y frescura sobre un fondo de maderas secas.",
        perfumer: "Jacques Polge",
        year: 2010,
        olfactiveFamily: "Aromático · Amaderado",
      },
      {
        slug: "bleu-de-chanel-eau-de-parfum",
        name: "Bleu de Chanel",
        concentration: "Eau de Parfum",
        shortConcentration: "EDP",
        href: "/perfume/bleu-de-chanel-eau-de-parfum",
        current: true,
        catalogRef: "N° 23 — 002",
        editorialSrc:
          "/media/perfumes/bleu-de-chanel-edp/edp/bleu-edp-hero-final.png",
        heroFocus: "45% 48%",
        firmaFilmSrc:
          "/media/perfumes/bleu-de-chanel-edp/edp/bleu-edp-cinematic-bottle.mp4",
        descriptor: "AROMÁTICO · AMADERADO · AMBARADO",
        editorialSummary:
          "Cedro ambarado, notas amaderadas almizcladas y sándalo de Nueva Caledonia aportan profundidad y calidez.",
        perfumer: "Jacques Polge",
        year: 2014,
        olfactiveFamily: "Aromático · Amaderado",
      },
      {
        slug: "bleu-de-chanel-parfum",
        name: "Bleu de Chanel",
        concentration: "Parfum",
        shortConcentration: "Parfum",
        catalogRef: "N° 23 — 003",
        editorialSrc: "/media/perfumes/bleu-de-chanel-edp/bleu-parfum-hero-final.png",
        heroFocus: "45% 48%",
        descriptor: "AROMÁTICO · INTENSAMENTE AMADERADO",
        editorialSummary:
          "El sándalo de Nueva Caledonia se funde con maderas intensas para revelar una expresión más densa y refinada.",
        perfumer: "Olivier Polge",
        year: 2018,
        olfactiveFamily: "Aromático · Amaderado",
      },
      {
        slug: "bleu-de-chanel-lexclusif",
        name: "Bleu de Chanel",
        concentration: "L’Exclusif",
        shortConcentration: "L’Exclusif",
        catalogRef: "N° 23 — 004",
        editorialSrc: "/media/perfumes/bleu-de-chanel-edp/bleu-lexclusif-hero-final.png",
        heroFocus: "75% 48%",
        descriptor: "AMBARADO · AMADERADO · CUERO",
        editorialSummary:
          "Sándalo, una nota de cuero y resina de ládano se funden con maderas ambaradas para construir la interpretación más intensa y madura de la colección.",
        perfumer: "Olivier Polge",
        year: 2025,
        olfactiveFamily: "Ambarado · Aromático",
      },
    ],
  },
};

export function getPerfumePresentation(
  slug: string,
): PerfumePresentation | null {
  return PRESENTATIONS[slug] ?? null;
}

/**
 * Chapter 02 data for a single perfume record.
 * Never falls back to another concentration/slug — missing data means no chapter.
 */
export function resolveSignatureChapter(slug: string): {
  notesChapter?: NotesChapterPresentation;
  signatureNotes?: SignatureNote[];
} {
  const record = getPerfumePresentation(slug);
  if (!record) return {};
  return {
    notesChapter: record.notesChapter,
    signatureNotes: record.signatureNotes,
  };
}

/**
 * Chapter 03 interactive map for a single perfume record.
 * Requires stillLifeSrc — never inherits another slug’s photograph or stages.
 */
export function resolveOlfactiveArchitecture(slug: string): {
  architecture?: ArchitecturePresentation;
  signatureNotes?: SignatureNote[];
} {
  const record = getPerfumePresentation(slug);
  if (!record?.architecture?.stillLifeSrc) return {};
  return {
    architecture: record.architecture,
    signatureNotes: record.signatureNotes,
  };
}

/** Prefer architecture; fall back to legacy pyramid key. */
export function getArchitecture(
  presentation: PerfumePresentation,
): ArchitecturePresentation | undefined {
  return presentation.architecture ?? presentation.pyramid;
}

export function resolvePerfumePresentation(
  slug: string,
  fallbackName: string,
): PerfumePresentation {
  return (
    getPerfumePresentation(slug) ?? {
      atmosphere: DEFAULT_ATMOSPHERE,
      heroName: fallbackName,
      brandName: "",
    }
  );
}
