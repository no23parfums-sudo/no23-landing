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
  notes: NoteEntry[];
};

/**
 * Editorial highlight for Identidad olfativa.
 * Exactly three per fragrance when complete: top, heart, base.
 */
export type SignatureNote = {
  stage: NoteStageId;
  label: string;
  note: NoteEntry;
  /** Short museum caption under the note name */
  editorialLine?: string;
};

export type PerfumerPresentation = {
  name: string;
  portraitSrc?: string;
  creditLabel?: string;
};

/** Continuum reading — longevity, sillage, projection, versatility */
export type ContinuumReading = {
  reading: string;
  /** 0–1 position on a quiet continuum — never a score or bar */
  position?: number;
};

/** Spectrum reading — seasons, occasions */
export type SpectrumReading = {
  reading: string;
  spectrum: string[];
  active: string[];
};

/**
 * Wear profile contract — data-driven, source-agnostic.
 * UI consumes these fields without fragrance-specific assumptions.
 */
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

export type StoryBlock = {
  id: string;
  title: string;
  body: string;
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
  /** When set, the variant is navigable. Omit until the perfume record exists. */
  href?: string;
  current?: boolean;
};

/**
 * Full presentation contract for the permanent fragrance template.
 * Components consume this shape — never fragrance-specific JSX.
 */
export type PerfumePresentation = {
  atmosphere: AtmosphereId;
  heroName: string;
  /**
   * Optional stacked display lines for the hero title.
   * Falls back to a single-line `heroName` when omitted.
   */
  heroTitleLines?: string[];
  brandName: string;
  brandLogoSrc?: string;
  /** Primary hero visual when available */
  editorialSrc?: string;
  /** Bottle cutout — fallback only when editorialSrc is absent */
  bottleSrc?: string;
  archivalCaption?: string;
  yearFallback?: number;
  perfumer?: PerfumerPresentation;

  /**
   * Three editorial signature notes: [top, heart, base].
   * Complete inventory lives only in `pyramid`.
   */
  signatureNotes?: SignatureNote[];

  signatureCharacter?: {
    accords: string[];
    lede?: string;
  };

  performance?: PerformancePresentation;

  pyramid?: {
    stages: NoteStage[];
  };

  story?: {
    intro?: string;
    blocks: StoryBlock[];
  };

  related?: RelatedFragrance[];

  collection?: {
    title?: string;
    members: CollectionMember[];
  };

  /**
   * Hero concentration index.
   * Falls back to `collection.members` when omitted.
   */
  variants?: CollectionMember[];
};

const PRESENTATIONS: Record<string, PerfumePresentation> = {
  "bleu-de-chanel-eau-de-parfum": {
    atmosphere: "nocturne",
    heroName: "Bleu de Chanel",
    heroTitleLines: ["Bleu de", "Chanel"],
    brandName: "Chanel",
    brandLogoSrc: "/media/brands/chanel/logo-black.png",
    editorialSrc: "/media/perfumes/bleu-de-chanel-edp/hero-editorial.png",
    bottleSrc: "/media/perfumes/bleu-de-chanel-edp/bottle-front.png",
    archivalCaption:
      "Una referencia moderna del aromático amaderado: luminosa al inicio, profunda en incienso y maderas.",
    yearFallback: 2014,
    perfumer: {
      name: "Jacques Polge",
      portraitSrc: "/media/perfumers/jacques-polge/portrait.jpeg",
      creditLabel: "Creado por",
    },
    signatureNotes: [
      {
        stage: "top",
        label: "Top",
        note: {
          name: "Grapefruit",
          imageSrc: "/media/notes/grapefruit/editorial.jpg",
        },
        editorialLine: "Un destello cítrico, amargo y luminoso.",
      },
      {
        stage: "heart",
        label: "Heart",
        note: {
          name: "Jasmine",
          imageSrc: "/media/notes/jasmine/editorial.jpg",
        },
        editorialLine: "Flor blanca, cálida, casi cremosa en el centro.",
      },
      {
        stage: "base",
        label: "Base",
        note: {
          name: "Sandalwood",
          imageSrc: "/media/notes/sandalwood/editorial.jpg",
        },
        editorialLine: "Madera suave que sostiene el silencio final.",
      },
    ],
    signatureCharacter: {
      lede: "Una presencia amaderada y mineral, sostenida por un frescor cítrico contenido.",
      accords: ["Woody", "Citrus", "Incense", "Amber", "Fresh Spicy"],
    },
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
    pyramid: {
      stages: [
        {
          id: "top",
          label: "Top",
          notes: [
            { name: "Grapefruit" },
            { name: "Lemon" },
            { name: "Mint" },
            { name: "Pink Pepper" },
          ],
        },
        {
          id: "heart",
          label: "Heart",
          notes: [
            { name: "Ginger" },
            { name: "Nutmeg" },
            { name: "Jasmine" },
            { name: "Iso E Super" },
          ],
        },
        {
          id: "base",
          label: "Base",
          notes: [
            { name: "Incense" },
            { name: "Cedar" },
            { name: "Sandalwood" },
            { name: "Labdanum" },
            { name: "White Musk" },
          ],
        },
      ],
    },
    story: {
      intro:
        "Bleu de Chanel Eau de Parfum profundiza la firma de la línea: un diálogo entre frescura y madera, contenido en una forma arquitectónica.",
      blocks: [
        {
          id: "launch",
          title: "Lanzamiento",
          body: "La versión Eau de Parfum llega en 2014 como una lectura más densa de la composición original, ampliando la presencia amaderada sin abandonar el gesto cítrico inicial.",
        },
        {
          id: "inspiration",
          title: "Inspiración",
          body: "La línea Bleu se concibe como una expresión contemporánea de elegancia masculina: precisión, silencio y una libertad contenida.",
        },
        {
          id: "creative",
          title: "Dirección creativa",
          body: "El frasco cuadrado y el azul profundo funcionan como una declaración tipográfica: menos ornamento, más estructura.",
        },
        {
          id: "perfumer",
          title: "Perfumer",
          body: "Jacques Polge, nariz de Chanel durante décadas, firma una composición que privilegia el equilibrio sobre el exceso.",
        },
        {
          id: "context",
          title: "Contexto",
          body: "En el archivo NO.23, Bleu EDP se lee como una pieza de referencia del aromático amaderado contemporáneo.",
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
      },
      {
        slug: "bleu-de-chanel-eau-de-parfum",
        name: "Bleu de Chanel",
        concentration: "Eau de Parfum",
        href: "/perfume/bleu-de-chanel-eau-de-parfum",
        current: true,
      },
      {
        slug: "bleu-de-chanel-parfum",
        name: "Bleu de Chanel",
        concentration: "Parfum",
      },
      {
        slug: "bleu-de-chanel-lexclusif",
        name: "Bleu de Chanel",
        concentration: "L’Exclusif",
      },
    ],
    collection: {
      title: "Línea Bleu de Chanel",
      members: [
        {
          slug: "bleu-de-chanel-eau-de-toilette",
          name: "Bleu de Chanel",
          concentration: "Eau de Toilette",
          href: "/biblioteca",
        },
        {
          slug: "bleu-de-chanel-eau-de-parfum",
          name: "Bleu de Chanel",
          concentration: "Eau de Parfum",
          href: "/perfume/bleu-de-chanel-eau-de-parfum",
          current: true,
        },
        {
          slug: "bleu-de-chanel-parfum",
          name: "Bleu de Chanel",
          concentration: "Parfum",
          href: "/biblioteca",
        },
        {
          slug: "bleu-de-chanel-extrait",
          name: "Bleu de Chanel",
          concentration: "Extrait",
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
