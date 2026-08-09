import type { AtmosphereId } from "./atmosphere";
import { DEFAULT_ATMOSPHERE } from "./atmosphere";

/* —— Shared editorial atoms —— */

export type NoteEntry = {
  name: string;
  /** Ingredient photograph — optional until the media library is complete */
  imageSrc?: string;
  slug?: string;
};

export type NoteStageId = "top" | "heart" | "base";

export type NoteStage = {
  id: NoteStageId | string;
  label: string;
  /** Short sensory reading for architecture annotations */
  reading?: string;
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
  eyebrow?: string;
  title?: string;
  lede?: string;
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
  position?: number;
};

export type SpectrumReading = {
  reading: string;
  spectrum: string[];
  active: string[];
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
};

export type RelatedFragrance = {
  slug: string;
  name: string;
  concentration?: string;
  href: string;
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

export type ArchitecturePresentation = {
  eyebrow?: string;
  title?: string;
  lede?: string;
  stages: NoteStage[];
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
  performance?: PerformancePresentation;

  related?: RelatedFragrance[];

  collection?: {
    title?: string;
    members: CollectionMember[];
  };

  variants?: CollectionMember[];
};

const PRESENTATIONS: Record<string, PerfumePresentation> = {
  "bleu-de-chanel-eau-de-parfum": {
    atmosphere: "nocturne",
    heroName: "Bleu de Chanel",
    heroTitleLines: ["Bleu de", "Chanel"],
    brandName: "Chanel",
    brandLogoSrc: "/media/brands/chanel/logo-black.png",
    editorialSrc: "/media/perfumes/bleu-de-chanel-edp/bleu-edp-hero.png",
    bottleSrc: "/media/perfumes/bleu-de-chanel-edp/bottle-front.png",
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
      eyebrow: "Notas",
      title: "Ingredientes principales",
      lede: "Tres materias que sostienen la lectura: la apertura, el corazón y el asentamiento.",
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
      longevity: {
        reading: "Del mediodía al anochecer",
        position: 0.72,
      },
      sillage: {
        reading: "Estela contenida",
        position: 0.42,
      },
      projection: {
        reading: "Presencia cercana",
        position: 0.48,
      },
      versatility: {
        reading: "Amplia",
        position: 0.68,
        poles: ["Íntimo", "Declarativo"],
      },
      seasons: {
        reading: "Climas frescos",
        spectrum: ["Primavera", "Verano", "Otoño", "Invierno"],
        active: ["Otoño", "Invierno", "Primavera"],
      },
      occasions: {
        reading: "Del día a la noche",
        spectrum: ["Día", "Trabajo", "Noche", "Formal"],
        active: ["Día", "Trabajo", "Noche"],
      },
    },
    /**
     * Pirámide completa — consenso Fragrantica (fuente primaria).
     * Bleu de Chanel Eau de Parfum, 2014, Jacques Polge.
     */
    architecture: {
      eyebrow: "Composición",
      title: "Arquitectura olfativa",
      lede: "Se abre con cítricos brillantes, evoluciona hacia un corazón especiado y termina en un fondo amaderado y ahumado, marcado por el incienso.",
      stages: [
        {
          id: "top",
          label: "Salida",
          reading: "Cítricos brillantes y un frescor contenido.",
          notes: [
            {
              name: "Pomelo",
              imageSrc: "/media/notes/grapefruit/editorial.jpg",
            },
            { name: "Limón" },
            { name: "Menta" },
            { name: "Bergamota" },
            { name: "Pimienta rosa" },
            { name: "Aldehídos" },
            { name: "Coriandro" },
          ],
        },
        {
          id: "heart",
          label: "Corazón",
          reading: "Especia seca que sostiene el centro de la composición.",
          notes: [
            { name: "Jengibre", imageSrc: "/media/notes/ginger/editorial.jpg" },
            {
              name: "Jazmín",
              imageSrc: "/media/notes/jasmine/editorial.jpg",
            },
            { name: "Nuez moscada" },
            { name: "Melón" },
          ],
        },
        {
          id: "base",
          label: "Fondo",
          reading: "Incienso, maderas y resinas en el asentamiento final.",
          notes: [
            {
              name: "Incienso",
              imageSrc: "/media/notes/incense/editorial.jpg",
            },
            { name: "Ámbar" },
            { name: "Cedro" },
            {
              name: "Sándalo",
              imageSrc: "/media/notes/sandalwood/editorial.jpg",
            },
            { name: "Amberwood" },
            { name: "Pachulí" },
            { name: "Ládano" },
          ],
        },
      ],
    },
    moodboard: {
      eyebrow: "Inspiración",
      title: "El mundo que lo rodea",
      lede: "Contrastes de noche urbana, agua profunda y materias táctiles que acompañan la lectura de la fragancia.",
      swatches: [
        { id: "ink", hex: "#0a0a0b", label: "Tinta" },
        { id: "navy", hex: "#1a2744", label: "Azul noche" },
        { id: "slate", hex: "#4a5560", label: "Pizarra" },
        { id: "stone", hex: "#8a8580", label: "Piedra" },
        { id: "sand", hex: "#c4b8a8", label: "Arena" },
        { id: "ivory", hex: "#eee8dc", label: "Marfil" },
      ],
      plates: [
        {
          id: "lead",
          imageSrc: "/media/perfumes/bleu-de-chanel-edp/hero-editorial.png",
          role: "lead",
          caption: "Frasco",
          focus: "62% 45%",
        },
        {
          id: "citrus",
          imageSrc: "/media/notes/grapefruit/editorial.jpg",
          role: "detail",
          caption: "Cítrico",
          focus: "50% 40%",
        },
        {
          id: "spice",
          imageSrc: "/media/notes/ginger/editorial.jpg",
          role: "texture",
          caption: "Especia",
          focus: "45% 50%",
        },
        {
          id: "smoke",
          imageSrc: "/media/notes/incense/editorial.jpg",
          role: "support",
          caption: "Humos",
          focus: "50% 35%",
        },
        {
          id: "wood",
          imageSrc: "/media/notes/sandalwood/editorial.jpg",
          role: "detail",
          caption: "Madera",
          focus: "48% 55%",
        },
      ],
    },
    history: {
      eyebrow: "Historia",
      title: "La línea Bleu",
      lede: "Una secuencia de concentraciones que profundiza la misma idea olfativa.",
      events: [
        {
          id: "2010-edt",
          year: "2010",
          label: "Eau de Toilette",
          body: "Lanzamiento de la línea: cítricos luminosos sobre una base amaderada.",
        },
        {
          id: "2014-edp",
          year: "2014",
          label: "Eau de Parfum",
          body: "Lectura más densa: mayor presencia de incienso, ámbar y maderas.",
          href: "/perfume/bleu-de-chanel-eau-de-parfum",
          imageSrc: "/media/perfumes/bleu-de-chanel-edp/bottle-front.png",
        },
        {
          id: "2018-parfum",
          year: "2018",
          label: "Parfum",
          body: "Concentración más cerrada y especiada, con menos énfasis en la salida cítrica.",
        },
        {
          id: "line-today",
          year: "Hoy",
          label: "Línea activa",
          body: "EDT, EDP y Parfum conviven como lecturas distintas de un mismo eje.",
        },
      ],
    },
    related: [
      {
        slug: "bleu-de-chanel-eau-de-toilette",
        name: "Bleu de Chanel",
        concentration: "Eau de Toilette",
        href: "/biblioteca",
      },
      {
        slug: "bleu-de-chanel-parfum",
        name: "Bleu de Chanel",
        concentration: "Parfum",
        href: "/biblioteca",
      },
    ],
    variants: [
      {
        slug: "bleu-de-chanel-eau-de-toilette",
        name: "Bleu de Chanel",
        concentration: "Eau de Toilette",
        shortConcentration: "EDT",
        catalogRef: "N° 23 — 001",
        editorialSrc: "/media/perfumes/bleu-de-chanel-edp/bleu-edt-hero.png",
        heroFocus: "45% 48%",
        descriptor: "AROMÁTICO · AMADERADO · FRESCO",
        editorialSummary:
          "Cítricos y un acorde aromático abren la composición, sobre notas de cedro y sándalo de Nueva Caledonia.",
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
        editorialSrc: "/media/perfumes/bleu-de-chanel-edp/bleu-edp-hero.png",
        heroFocus: "50% 48%",
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
        editorialSrc: "/media/perfumes/bleu-de-chanel-edp/bleu-parfum-hero.png",
        heroFocus: "43% 48%",
        descriptor: "AROMÁTICO · INTENSAMENTE AMADERADO",
        editorialSummary:
          "Una apertura fresca evoluciona hacia un acorde intenso de cedro y sándalo de Nueva Caledonia.",
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
        editorialSrc: "/media/perfumes/bleu-de-chanel-edp/bleu-lexclusif-hero.png",
        heroFocus: "10% 48%",
        descriptor: "AMBARADO · AMADERADO · CUERO",
        editorialSummary:
          "Sándalo, notas coriáceas y resinosas de ládano y maderas ambaradas construyen la interpretación más intensa de la colección.",
        perfumer: "Olivier Polge",
        year: 2025,
        olfactiveFamily: "Ambarado · Aromático",
      },
    ],
    collection: {
      title: "Línea Bleu de Chanel",
      members: [
        {
          slug: "bleu-de-chanel-eau-de-toilette",
          name: "Bleu de Chanel",
          concentration: "Eau de Toilette",
          shortConcentration: "EDT",
          href: "/biblioteca",
        },
        {
          slug: "bleu-de-chanel-eau-de-parfum",
          name: "Bleu de Chanel",
          concentration: "Eau de Parfum",
          shortConcentration: "EDP",
          href: "/perfume/bleu-de-chanel-eau-de-parfum",
          current: true,
        },
        {
          slug: "bleu-de-chanel-parfum",
          name: "Bleu de Chanel",
          concentration: "Parfum",
          shortConcentration: "Parfum",
          href: "/biblioteca",
        },
      ],
    },
  },
};

export function getPerfumePresentation(
  slug: string,
): PerfumePresentation | null {
  return PRESENTATIONS[slug] ?? null;
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
