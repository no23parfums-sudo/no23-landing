export type UsageMomentId =
  | "daily"
  | "work"
  | "casual"
  | "date"
  | "night"
  | "party"
  | "special_occasion"
  | "formal"
  | "vacation_outdoor";

export type UsageMomentItem = {
  id: UsageMomentId;
  /** Optional label override. Defaults to the taxonomy label. */
  label?: string;
  /** Editorial suitability 0–1. Never shown as a percentage. */
  score: number;
};

export type UsageMomentsReading = {
  reading: string;
  items: UsageMomentItem[];
};

export const USAGE_MOMENT_TAXONOMY: Record<
  UsageMomentId,
  { label: string }
> = {
  daily: { label: "Uso diario" },
  work: { label: "Trabajo" },
  casual: { label: "Casual" },
  date: { label: "Citas" },
  night: { label: "Noche" },
  party: { label: "Fiestas" },
  special_occasion: { label: "Ocasiones especiales" },
  formal: { label: "Eventos formales" },
  vacation_outdoor: { label: "Vacaciones / Aire libre" },
};

type OccasionSpectrum = {
  reading: string;
  spectrum: string[];
  active: string[];
  weights?: number[];
};

function spectrumWeight(
  reading: OccasionSpectrum,
  index: number,
  label: string,
): number {
  const w = reading.weights?.[index];
  if (typeof w === "number") return Math.min(1, Math.max(0, w));
  return reading.active.includes(label) ? 0.88 : 0.22;
}

export type ResolvedUsageMoment = {
  id: UsageMomentId;
  label: string;
  score: number;
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

function labelFor(id: UsageMomentId, override?: string) {
  const custom = override?.trim();
  return custom || USAGE_MOMENT_TAXONOMY[id].label;
}

const LABEL_TO_ID: { test: (n: string) => boolean; id: UsageMomentId }[] = [
  { id: "daily", test: (n) => n.includes("diario") || n.includes("daily") || n === "día" || n === "dia" || n === "day" },
  { id: "work", test: (n) => n.includes("trabajo") || n.includes("work") },
  { id: "casual", test: (n) => n.includes("casual") },
  { id: "date", test: (n) => n.includes("cita") || n.includes("date") },
  { id: "night", test: (n) => n.includes("noche") || n.includes("night") },
  { id: "party", test: (n) => n.includes("fiesta") || n.includes("party") },
  { id: "special_occasion", test: (n) => n.includes("especial") || n.includes("special") },
  { id: "formal", test: (n) => n.includes("formal") || n.includes("evento") },
  { id: "vacation_outdoor", test: (n) => n.includes("vacac") || n.includes("aire") || n.includes("outdoor") },
];

function idFromLabel(label: string): UsageMomentId | null {
  const n = label.toLowerCase().trim();
  return LABEL_TO_ID.find((row) => row.test(n))?.id ?? null;
}

function fromSpectrum(reading: OccasionSpectrum): ResolvedUsageMoment[] {
  const matched: ResolvedUsageMoment[] = [];
  for (let i = 0; i < reading.spectrum.length; i++) {
    const label = reading.spectrum[i];
    if (!label) continue;
    const id = idFromLabel(label);
    if (!id) continue;
    if (matched.some((item) => item.id === id)) continue;
    matched.push({
      id,
      label: USAGE_MOMENT_TAXONOMY[id].label,
      score: spectrumWeight(reading, i, label),
    });
    if (matched.length === 3) break;
  }
  return matched;
}

export function resolveUsageMoments(input?: {
  moments?: UsageMomentsReading;
  occasions?: OccasionSpectrum;
}): { reading: string; items: ResolvedUsageMoment[] } | null {
  const authored = input?.moments;
  if (authored?.items?.length) {
    const items = authored.items.slice(0, 3).map((item) => ({
      id: item.id,
      label: labelFor(item.id, item.label),
      score: clamp01(item.score),
    }));
    if (!items.length) return null;
    return { reading: authored.reading, items };
  }
  const occasions = input?.occasions;
  if (!occasions) return null;
  const items = fromSpectrum(occasions);
  if (!items.length) return null;
  return { reading: occasions.reading, items };
}
