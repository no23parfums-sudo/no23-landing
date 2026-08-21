import type {
  PerformancePresentation,
  SpectrumReading,
} from "./presentation";

export type PerformanceVariantId = "A" | "B" | "C" | "C1" | "C3";

export type PerformanceVariantModel = {
  hours: string | null;
  hoursCatalog: string | null;
  hoursMin: number | null;
  hoursMax: number | null;
  longevityBand: { start: number; end: number } | null;
  longevityReading: string;
  longevityPosition: number;
  projectionMarker: string | null;
  projectionReading: string | null;
  projectionPosition: number;
  projectionLevel: number;
  sillageMarker: string | null;
  sillageReading: string | null;
  sillagePosition: number;
  sillageLevel: number;
  seasons?: SpectrumReading;
  occasions?: SpectrumReading;
  versatilityMarker: string | null;
  versatilityReading: string | null;
  versatilityPosition: number;
  versatilityPoles: [string, string];
  lectura: string | null;
};

export const LONGEVITY_MARKS = [
  { label: "2H", at: 0.2 },
  { label: "4H", at: 0.4 },
  { label: "6H", at: 0.6 },
  { label: "8H", at: 0.8 },
  { label: "10H+", at: 1 },
];

export const PROJECTION_MARKS = [
  { label: "Piel", at: 0 },
  { label: "Cercana", at: 1 / 3 },
  { label: "Presente", at: 2 / 3 },
  { label: "Amplia", at: 1 },
];

export const SILLAGE_MARKS = [
  { label: "Contenida", at: 0 },
  { label: "Moderada", at: 0.5 },
  { label: "Marcada", at: 1 },
];

/** Longevity rail is calibrated to 10H+ = 1. Other perfumes map through this. */
export const LONGEVITY_SCALE_HOURS = 10;

export function hoursToScale(
  hours: number,
  scaleMax = LONGEVITY_SCALE_HOURS,
): number {
  if (scaleMax <= 0) return 0;
  return Math.min(1, Math.max(0, hours / scaleMax));
}

function isHoursRange(
  range?: { min: number; max: number } | null,
): range is { min: number; max: number } {
  return Boolean(range && range.min > 0 && range.max >= range.min);
}

function hoursLabel(
  range?: { min: number; max: number } | null,
  dash = "–",
): string | null {
  if (!isHoursRange(range)) return null;
  return `${range.min}${dash}${range.max} H`;
}

export function splitEditorialReading(reading: string): {
  primary: string;
  secondary?: string;
} {
  const comma = reading.indexOf(",");
  if (comma === -1) return { primary: reading };
  const secondary = reading.slice(comma + 1).trim();
  return {
    primary: reading.slice(0, comma).trim(),
    secondary: secondary || undefined,
  };
}

export function discreteLevel(position: number, steps: number): number {
  if (steps <= 1) return 0;
  return Math.min(
    steps - 1,
    Math.max(0, Math.round(Math.min(1, Math.max(0, position)) * (steps - 1))),
  );
}

export function seasonKind(
  label: string,
  index: number,
): "spring" | "summer" | "autumn" | "winter" {
  const n = label.toLowerCase();
  if (n.startsWith("prim") || n.includes("spring")) return "spring";
  if (n.startsWith("ver") || n.includes("summer")) return "summer";
  if (n.startsWith("oto") || n.includes("autumn") || n.includes("fall")) {
    return "autumn";
  }
  if (n.startsWith("inv") || n.includes("winter")) return "winter";
  const order = ["spring", "summer", "autumn", "winter"] as const;
  return order[index % 4];
}

export function spectrumActiveLabels(
  reading: SpectrumReading,
  threshold = 0.75,
): string[] {
  return reading.spectrum.filter(
    (label, i) => spectrumWeight(reading, i, label) >= threshold,
  );
}

export function buildPerformanceVariantModel(
  performance: PerformancePresentation,
): PerformanceVariantModel | null {
  if (!performance.longevity?.reading) return null;
  const longevity = performance.longevity;
  const hoursRange = isHoursRange(longevity.hoursRange)
    ? longevity.hoursRange
    : null;
  return {
    hours: hoursLabel(hoursRange),
    hoursCatalog: hoursLabel(hoursRange, "—"),
    hoursMin: hoursRange?.min ?? null,
    hoursMax: hoursRange?.max ?? null,
    longevityBand: hoursRange
      ? {
          start: hoursToScale(hoursRange.min),
          end: hoursToScale(hoursRange.max),
        }
      : null,
    longevityReading: longevity.reading,
    longevityPosition: longevity.position ?? 0.7,
    projectionMarker: performance.projection?.marker ?? performance.projection?.reading ?? null,
    projectionReading: performance.projection?.reading ?? null,
    projectionPosition: performance.projection?.position ?? 0.5,
    projectionLevel: discreteLevel(performance.projection?.position ?? 0.5, 4),
    sillageMarker: performance.sillage?.marker ?? performance.sillage?.reading ?? null,
    sillageReading: performance.sillage?.reading ?? null,
    sillagePosition: performance.sillage?.position ?? 0.45,
    sillageLevel: discreteLevel(performance.sillage?.position ?? 0.45, 3),
    seasons: performance.seasons,
    occasions: performance.occasions,
    versatilityMarker:
      performance.versatility?.marker ?? performance.versatility?.reading ?? null,
    versatilityReading: performance.versatility?.reading ?? null,
    versatilityPosition: performance.versatility?.position ?? 0.65,
    versatilityPoles: performance.versatility?.poles ?? [
      "Especializada",
      "Muy versátil",
    ],
    lectura: performance.lectura ?? null,
  };
}

export function spectrumWeight(
  reading: SpectrumReading,
  index: number,
  label: string,
): number {
  const w = reading.weights?.[index];
  if (typeof w === "number") return Math.min(1, Math.max(0, w));
  return reading.active.includes(label) ? 0.88 : 0.22;
}
