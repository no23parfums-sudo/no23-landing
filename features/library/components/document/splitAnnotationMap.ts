/**
 * Split V6 annotation map — SOURCE-image space (0..1 of edp-notes-section3.png).
 * Anchors are the canonical ingredient points. Labels are editorial.
 * Project through object-fit: cover before painting.
 */

export type SplitOlfactoryState =
  | "salida"
  | "corazon"
  | "fondo"
  | "composition";

export type SplitAlign = "left" | "right";

export type SplitCallout = {
  id: string;
  family: "salida" | "corazon" | "fondo";
  /** 0..1 of the uncropped still-life. */
  sourceX: number;
  sourceY: number;
  align: SplitAlign;
  /** Extra label shift in source-normalized Y after projection, editorial only. */
  labelShiftY?: number;
};

export const SPLIT_STILL_LIFE = {
  sourceW: 1024,
  sourceH: 682,
  objectPosX: 0.42,
  objectPosY: 0.48,
} as const;

export const SPLIT_ANNO_MAP: Record<string, SplitCallout> = {
  aldehidos: {
    id: "aldehidos",
    family: "salida",
    sourceX: 0.17,
    sourceY: 0.2,
    align: "right",
    labelShiftY: -0.04,
  },
  menta: {
    id: "menta",
    family: "salida",
    sourceX: 0.16,
    sourceY: 0.44,
    align: "right",
    labelShiftY: -0.06,
  },
  bergamota: {
    id: "bergamota",
    family: "salida",
    sourceX: 0.29,
    sourceY: 0.43,
    align: "right",
    labelShiftY: -0.05,
  },
  limon: {
    id: "limon",
    family: "salida",
    sourceX: 0.21,
    sourceY: 0.57,
    align: "right",
  },
  pomelo: {
    id: "pomelo",
    family: "salida",
    sourceX: 0.14,
    sourceY: 0.69,
    align: "right",
  },
  "pimienta-rosa": {
    id: "pimienta-rosa",
    family: "salida",
    sourceX: 0.27,
    sourceY: 0.68,
    align: "right",
    labelShiftY: 0.05,
  },
  coriandro: {
    id: "coriandro",
    family: "salida",
    sourceX: 0.11,
    sourceY: 0.79,
    align: "right",
    labelShiftY: 0.04,
  },

  jengibre: {
    id: "jengibre",
    family: "corazon",
    sourceX: 0.75,
    sourceY: 0.34,
    align: "left",
    labelShiftY: -0.06,
  },
  melon: {
    id: "melon",
    family: "corazon",
    sourceX: 0.9,
    sourceY: 0.38,
    align: "left",
    labelShiftY: -0.02,
  },
  jazmin: {
    id: "jazmin",
    family: "corazon",
    sourceX: 0.81,
    sourceY: 0.48,
    align: "left",
  },
  "nuez-moscada": {
    id: "nuez-moscada",
    family: "corazon",
    sourceX: 0.84,
    sourceY: 0.58,
    align: "left",
    labelShiftY: 0.03,
  },

  incienso: {
    id: "incienso",
    family: "fondo",
    sourceX: 0.5,
    sourceY: 0.7,
    align: "left",
    labelShiftY: -0.06,
  },
  ambar: {
    id: "ambar",
    family: "fondo",
    sourceX: 0.45,
    sourceY: 0.87,
    align: "left",
  },
  ladano: {
    id: "ladano",
    family: "fondo",
    sourceX: 0.62,
    sourceY: 0.89,
    align: "right",
    labelShiftY: 0.02,
  },
  cedro: {
    id: "cedro",
    family: "fondo",
    sourceX: 0.72,
    sourceY: 0.78,
    align: "left",
    labelShiftY: -0.03,
  },
  sandalo: {
    id: "sandalo",
    family: "fondo",
    sourceX: 0.83,
    sourceY: 0.74,
    align: "left",
  },
  pachuli: {
    id: "pachuli",
    family: "fondo",
    sourceX: 0.79,
    sourceY: 0.86,
    align: "left",
  },
  amberwood: {
    id: "amberwood",
    family: "fondo",
    sourceX: 0.88,
    sourceY: 0.91,
    align: "left",
    labelShiftY: 0.02,
  },
};

export type CoverProjection = {
  panelW: number;
  panelH: number;
  sourceW: number;
  sourceH: number;
  scale: number;
  renderedW: number;
  renderedH: number;
  offsetX: number;
  offsetY: number;
};

export function projectCover(panelW: number, panelH: number): CoverProjection {
  const { sourceW, sourceH, objectPosX, objectPosY } = SPLIT_STILL_LIFE;
  const scale = Math.max(panelW / sourceW, panelH / sourceH);
  const renderedW = sourceW * scale;
  const renderedH = sourceH * scale;
  const offsetX = (panelW - renderedW) * objectPosX;
  const offsetY = (panelH - renderedH) * objectPosY;
  return {
    panelW,
    panelH,
    sourceW,
    sourceH,
    scale,
    renderedW,
    renderedH,
    offsetX,
    offsetY,
  };
}

/** Source-normalized (0..1) → panel-normalized (0..1). */
export function sourceToPanel(
  sourceX: number,
  sourceY: number,
  cover: CoverProjection,
) {
  const x = cover.offsetX + sourceX * cover.renderedW;
  const y = cover.offsetY + sourceY * cover.renderedH;
  return {
    xPx: x,
    yPx: y,
    x: cover.panelW ? x / cover.panelW : sourceX,
    y: cover.panelH ? y / cover.panelH : sourceY,
  };
}

export function splitAnnoFor(id: string): SplitCallout | undefined {
  return SPLIT_ANNO_MAP[id];
}

export function splitStateFromPhase(
  phase: "top" | "heart" | "base" | "composition",
): SplitOlfactoryState {
  if (phase === "top") return "salida";
  if (phase === "heart") return "corazon";
  if (phase === "base") return "fondo";
  return "composition";
}

export function familyMatchesState(
  family: SplitCallout["family"],
  state: SplitOlfactoryState,
) {
  return family === state;
}
