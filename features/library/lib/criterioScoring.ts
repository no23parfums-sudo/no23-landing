/**
 * NO.23 Criterio — Scoring Methodology V1
 *
 * Editorial evaluation contract. Scores are authored per perfume
 * (not computed at runtime). This module documents the weights,
 * qualitative bands, and default popover copy so every future
 * fragrance is judged on the same scale.
 */

export const CRITERIO_SCORING_VERSION = "1";

export type CriterioKind = "easeOfUse" | "blindBuy";

export type CriterioBand = {
  min: number;
  max: number;
  verdict: string;
};

export const CRITERIO_SCORING_V1 = {
  version: CRITERIO_SCORING_VERSION,
  easeOfUse: {
    label: "Facilidad de uso",
    definition:
      "How easy it is to incorporate the fragrance across moments, contexts and wearing styles.",
    explanation:
      "Qué tan sencillo es incorporar esta fragancia a distintos momentos, estaciones, contextos y estilos de uso.",
    weights: {
      occasionVersatility: 0.25,
      seasonalVersatility: 0.2,
      dayNightAdaptability: 0.15,
      easeOfDosage: 0.15,
      profileAccessibility: 0.15,
      officeTolerance: 0.1,
    },
    bands: [
      { min: 0, max: 3.9, verdict: "Difícil" },
      { min: 4.0, max: 5.9, verdict: "Exigente" },
      { min: 6.0, max: 7.4, verdict: "Fácil" },
      { min: 7.5, max: 8.9, verdict: "Muy fácil" },
      { min: 9.0, max: 10, verdict: "Excepcionalmente fácil" },
    ] satisfies CriterioBand[],
  },
  blindBuy: {
    label: "Compra a ciegas",
    definition:
      "How safe it is to purchase the fragrance without having tested it personally.",
    explanation:
      "Qué tan segura resulta su compra sin haberla probado, considerando consenso, polarización, versatilidad, accesibilidad del perfil y predictibilidad de desempeño.",
    weights: {
      consensus: 0.3,
      polarizationRisk: 0.2,
      overallVersatility: 0.2,
      scentDnaFamiliarity: 0.15,
      performancePredictability: 0.1,
      priceExpectationRisk: 0.05,
    },
    bands: [
      { min: 0, max: 3.9, verdict: "Riesgosa" },
      { min: 4.0, max: 5.9, verdict: "Selectiva" },
      { min: 6.0, max: 7.4, verdict: "Segura" },
      { min: 7.5, max: 8.9, verdict: "Muy segura" },
      { min: 9.0, max: 10, verdict: "Excepcionalmente segura" },
    ] satisfies CriterioBand[],
  },
} as const;

export function criterioVerdict(kind: CriterioKind, score: number): string {
  const bands = CRITERIO_SCORING_V1[kind].bands;
  const clamped = Math.min(10, Math.max(0, score));
  const match = bands.find((band) => clamped >= band.min && clamped <= band.max);
  return match?.verdict ?? bands[bands.length - 1].verdict;
}

/** Bar geometry from the authoritative 0–10 score. */
export function criterioBarPosition(score: number): number {
  return Math.min(1, Math.max(0, score / 10));
}

export function criterioExplanation(kind: CriterioKind): string {
  return CRITERIO_SCORING_V1[kind].explanation;
}
