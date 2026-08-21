/**
 * Scroll-linked Firma assembly — default split master-template motion.
 * Dev fallback: ?firmaMotion=timed
 *
 * Progress 0: Firma top meets the viewport bottom (just entering).
 * Progress 1: Firma top meets viewport center — composition is identity.
 * Travel = 50vh. No pin, no extra runway. Clamped, so lower-page scroll
 * does not reanimate.
 */
export const FIRMA_LINKED_OFFSET = ["start end", "start center"] as const;

/** Viewport travel implied by the offset (top-at-bottom → top-at-center). */
export const FIRMA_LINKED_TRAVEL_VH = 50;

export const FIRMA_LINKED_RANGES = {
  bottle: [0, 0.55],
  water: [0.08, 0.68],
  grapefruit: [0.18, 0.62],
  smoke: [0.28, 0.82],
  eyebrow: [0.38, 0.58],
  title: [0.43, 0.67],
  lead: [0.5, 0.72],
  support: [0.58, 0.8],
};

export const FIRMA_LINKED_FROM = {
  bottle: {
    clipPath: "inset(18% 0% 8% 0%)",
    scale: 1.045,
    y: 31,
    opacity: 0.8,
  },
  water: {
    clipPath: "inset(18% 0% 0% 0%)",
    scale: 1.015,
    y: 42,
    opacity: 0.65,
  },
  grapefruit: {
    clipPath: "inset(9% 0% 0% 0%)",
    scale: 1.02,
    y: 14,
    opacity: 0.6,
  },
  smoke: {
    clipPath: "inset(14% 0% 0% 0%)",
    scale: 1.015,
    y: 27,
    opacity: 0.55,
  },
  copyY: 14,
} as const;

export const FIRMA_LINKED_CLIP_REST = "inset(0% 0% 0% 0%)";
