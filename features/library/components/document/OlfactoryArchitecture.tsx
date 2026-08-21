"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import type {
  ArchitectureHighlight,
  ArchitecturePresentation,
  NoteEntry,
  NoteMapAnchor,
  NoteStage,
  SignatureNote,
} from "../../lib/presentation";
import { setupS2S3HandoffRuntime, setupS2S3HandoffRuntimeContinuous } from "./s2s3HandoffRuntime";
import {
  splitStateFromPhase,
  type SplitOlfactoryState,
} from "./splitAnnotationMap";

const NOTE_EASE = [0.22, 1, 0.36, 1] as const;

export type AtlasPhaseId = "top" | "heart" | "base" | "composition";

type OlfactoryArchitectureProps = {
  architecture?: ArchitecturePresentation | null;
  signatureNotes?: SignatureNote[];
  motionMode?: "current" | "continuous";
  /** Prototype split chapter — mutually exclusive with S2→S3 runtime. */
  layout?: "current" | "split";
  drivenPhase?: AtlasPhaseId;
  onDrivenPhaseChange?: (id: AtlasPhaseId) => void;
};

type PhaseId = AtlasPhaseId;
type RevealState = "dormant" | "active" | "explore" | "soft";

const PHASE_ORDER: PhaseId[] = ["top", "heart", "base", "composition"];

const PHASE_NAV: { id: PhaseId; index: string; label: string }[] = [
  { id: "top", index: "01", label: "Salida" },
  { id: "heart", index: "02", label: "Corazón" },
  { id: "base", index: "03", label: "Fondo" },
  { id: "composition", index: "04", label: "Composición" },
];

const COMPOSITION_SWEEP_MS = 880;

function phaseIndex(id: PhaseId) {
  return PHASE_ORDER.indexOf(id);
}

function noteId(note: NoteEntry) {
  return (
    note.id ??
    note.slug ??
    note.name
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/\s+/g, "-")
  );
}

function resolveMap(map: NoteMapAnchor) {
  const anchorX = map.anchorX ?? map.x ?? 50;
  const anchorY = map.anchorY ?? map.y ?? 50;
  const align = map.align ?? map.side ?? (anchorX >= 58 ? "right" : "left");
  const labelX =
    map.labelX ??
    (align === "right" ? Math.min(96, anchorX + 10) : Math.max(10, anchorX - 10));
  const labelY = map.labelY ?? anchorY;
  const hotspotX = map.hotspotX ?? anchorX;
  const hotspotY = map.hotspotY ?? anchorY;
  const hotspotW = map.hotspotW ?? 12;
  const hotspotH = map.hotspotH ?? 12;
  return {
    anchorX,
    anchorY,
    labelX,
    labelY,
    align,
    hotspotX,
    hotspotY,
    hotspotW,
    hotspotH,
  };
}

function leaderEndpoint(
  anchorX: number,
  anchorY: number,
  labelX: number,
  labelY: number,
) {
  const dx = labelX - anchorX;
  const dy = labelY - anchorY;
  const len = Math.hypot(dx, dy) || 1;
  const t = Math.max(0.12, 1 - 3.4 / len);
  return { x2: anchorX + dx * t, y2: anchorY + dy * t };
}

function signatureForStage(
  stageId: string,
  signatureNotes?: SignatureNote[],
) {
  return signatureNotes?.find((s) => s.stage === stageId);
}

const SPLIT_NOTE_GROUPS: Record<
  Exclude<SplitOlfactoryState, "composition">,
  string[][]
> = {
  salida: [
    ["aldehidos", "menta"],
    ["bergamota", "limon"],
    ["pomelo", "pimienta-rosa", "coriandro"],
  ],
  corazon: [
    ["jengibre", "melon"],
    ["jazmin", "nuez-moscada"],
  ],
  fondo: [
    ["incienso", "ambar", "ladano"],
    ["cedro", "sandalo"],
    ["pachuli", "amberwood"],
  ],
};

const SPLIT_STAGE_META: Record<
  Exclude<SplitOlfactoryState, "composition">,
  { index: string; label: string }
> = {
  salida: { index: "01", label: "Salida" },
  corazon: { index: "02", label: "Corazón" },
  fondo: { index: "03", label: "Fondo" },
};

function groupSplitNotes(
  state: Exclude<SplitOlfactoryState, "composition">,
  notes: NoteEntry[],
  noteRows?: string[][],
): string[][] {
  const byId = new Map(notes.map((note) => [noteId(note), note.name]));
  const groups = noteRows ?? SPLIT_NOTE_GROUPS[state] ?? [];
  const rows = groups
    .map((ids) => ids.map((id) => byId.get(id)).filter((name): name is string => Boolean(name)))
    .filter((row) => row.length);
  const used = new Set(rows.flat());
  const leftover = notes.map((note) => note.name).filter((name) => !used.has(name));
  if (leftover.length) rows.push(leftover);
  return rows;
}

function SplitSpatialNotes({
  state,
  notes,
  traits,
  noteRows,
  reduceMotion,
}: {
  state: Exclude<SplitOlfactoryState, "composition">;
  notes: NoteEntry[];
  traits?: string;
  noteRows?: string[][];
  reduceMotion: boolean;
}) {
  const rows = groupSplitNotes(state, notes, noteRows);
  const meta = SPLIT_STAGE_META[state];
  const [settled, setSettled] = useState(reduceMotion);

  useEffect(() => {
    setSettled(Boolean(reduceMotion));
    if (reduceMotion) return;
    const t = window.setTimeout(() => setSettled(true), 400);
    return () => window.clearTimeout(t);
  }, [state, reduceMotion]);

  return (
    <div className="split-anno">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={state}
          className="split-anno__block"
          data-state={state}
          data-settled={settled ? "true" : "false"}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{
            opacity: 0,
            y: -8,
            transition: { duration: 0.22, ease: NOTE_EASE },
          }}
          transition={{ duration: 0.36, delay: 0.04, ease: NOTE_EASE }}
        >
          <p className="split-anno__index">
            <span className="split-anno__num">{meta.index}</span>
            <span className="split-anno__sep" aria-hidden="true">
              —
            </span>
            <span className="split-anno__stage">{meta.label}</span>
          </p>
          <div className="split-anno__notes">
            {rows.map((row, i) => (
              <motion.p
                key={row.join("·")}
                className="split-anno__row"
                initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.24,
                  delay: reduceMotion ? 0 : 0.03 * (i + 1),
                  ease: NOTE_EASE,
                }}
              >
                {row.join(" · ")}
              </motion.p>
            ))}
          </div>
          {traits ? (
            <motion.p
              className="split-anno__traits"
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.24,
                delay: reduceMotion ? 0 : 0.03 * (rows.length + 1),
                ease: NOTE_EASE,
              }}
            >
              {traits}
            </motion.p>
          ) : null}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Annotation({
  note,
  reveal,
  featured,
  index,
}: {
  note: NoteEntry;
  reveal: RevealState;
  featured: boolean;
  index: number;
}) {
  const map = note.map;
  if (!map) return null;
  const { anchorX, anchorY, labelX, labelY, align } = resolveMap(map);
  const { x2, y2 } = leaderEndpoint(anchorX, anchorY, labelX, labelY);

  return (
    <li
      className="arch-atlas__anno"
      data-align={align}
      data-reveal={reveal}
      data-featured={featured ? "true" : "false"}
      style={
        {
          "--anno-i": index,
          "--anchor-x": `${anchorX}%`,
          "--anchor-y": `${anchorY}%`,
          "--label-x": `${labelX}%`,
          "--label-y": `${labelY}%`,
        } as CSSProperties
      }
    >
      <span className="arch-atlas__anno-dot" aria-hidden="true" />
      <svg
        className="arch-atlas__anno-leader"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <line
          className="arch-atlas__anno-leader-line"
          x1={anchorX}
          y1={anchorY}
          x2={x2}
          y2={y2}
          vectorEffect="non-scaling-stroke"
          pathLength={1}
        />
      </svg>
      <span className="arch-atlas__anno-label">{note.name}</span>
    </li>
  );
}

/** Museum lighting — phase family or single explore ingredient. */
function PhaseEmphasis({
  highlights,
  uid,
  mode,
}: {
  highlights: ArchitectureHighlight[];
  uid: string;
  mode: "phase" | "composition" | "explore" | "off";
}) {
  if (mode === "off" || !highlights.length) return null;
  const blurId = `${uid}-blur`;
  const dimMaskId = `${uid}-dim`;
  /* Restored controlled museum lighting */
  const dimFill =
    mode === "composition"
      ? "rgba(3, 5, 9, 0.1)"
      : mode === "explore"
        ? "rgba(3, 5, 9, 0.28)"
        : "rgba(3, 5, 9, 0.28)";
  const softBlurId = `${uid}-soft`;

  return (
    <svg
      className="arch-atlas__emphasis"
      data-mode={mode}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <filter id={blurId} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3.6" />
        </filter>
        <filter id={softBlurId} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5.2" />
        </filter>
        <mask
          id={dimMaskId}
          maskUnits="userSpaceOnUse"
          x="0"
          y="0"
          width="100"
          height="100"
        >
          <rect x="0" y="0" width="100" height="100" fill="white" />
          {highlights.map((h, i) => (
            <ellipse
              key={`m-${i}`}
              cx={h.cx}
              cy={h.cy}
              rx={h.rx}
              ry={h.ry}
              fill="black"
              filter={`url(#${blurId})`}
            />
          ))}
        </mask>
      </defs>

      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        fill={dimFill}
        mask={`url(#${dimMaskId})`}
      />

      {mode === "phase" || mode === "explore"
        ? highlights.map((h, i) => (
            <g key={`g-${i}`}>
              <ellipse
                className="arch-atlas__emphasis-glow"
                cx={h.cx}
                cy={h.cy}
                rx={h.rx * 1.02}
                ry={h.ry * 1.02}
                filter={`url(#${softBlurId})`}
              />
              <ellipse
                className="arch-atlas__emphasis-glow--core"
                cx={h.cx}
                cy={h.cy}
                rx={h.rx * 0.58}
                ry={h.ry * 0.58}
                filter={`url(#${blurId})`}
              />
            </g>
          ))
        : null}
    </svg>
  );
}

function CompositionSweep({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="arch-atlas__sweep" aria-hidden="true">
      <span className="arch-atlas__sweep-band arch-atlas__sweep-band--citrus" />
      <span className="arch-atlas__sweep-band arch-atlas__sweep-band--heart" />
      <span className="arch-atlas__sweep-band arch-atlas__sweep-band--woods" />
      <span className="arch-atlas__sweep-band arch-atlas__sweep-band--bottle" />
    </div>
  );
}

type FlatNote = {
  id: string;
  note: NoteEntry;
  stageId: string;
  index: number;
};

/**
 * Split editorial olfactory atlas (EDP still-life only).
 * Systems: image · lighting · annotation/hotspot — independently driven.
 */
export function OlfactoryArchitecture({
  architecture,
  signatureNotes,
  motionMode = "current",
  layout = "current",
  drivenPhase,
  onDrivenPhaseChange,
}: OlfactoryArchitectureProps) {
  const reduceMotion = useReducedMotion();
  const tablistId = useId();
  const uid = useId().replace(/:/g, "");
  const sectionRef = useRef<HTMLElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const [internalPhase, setInternalPhase] = useState<PhaseId>("top");
  const isSplit = layout === "split";
  const phase = isSplit && drivenPhase ? drivenPhase : internalPhase;
  const [panelTick, setPanelTick] = useState(0);
  const [sweeping, setSweeping] = useState(false);
  const [exploreId, setExploreId] = useState<string | null>(null);
  const prevPhaseRef = useRef<PhaseId>("top");

  const stages = architecture?.stages?.filter((s) => s.notes.length) ?? [];
  const stillLifeSrc = isSplit
    ? architecture?.stillLifeSplitSrc ?? architecture?.stillLifeSrc
    : architecture?.stillLifeSrc;
  const sectionBackgroundSrc =
    architecture?.sectionBackgroundSrc ?? stillLifeSrc;

  /*
   * Normalize deps so the effect array is always the same length / order.
   * stillLifeSrc may be undefined while concentration has no Architecture —
   * use "" so the slot still exists (never omit the dependency).
   */
  const reduceMotionDep = Boolean(reduceMotion);
  const stillLifeSrcDep = stillLifeSrc ?? "";
  const motionModeDep = motionMode === "continuous" ? "continuous" : "current";
  const layoutDep = isSplit ? "split" : "current";

  const flatNotes: FlatNote[] = stages.flatMap((stage) =>
    stage.notes.map((note, index) => ({
      id: noteId(note),
      note,
      stageId: stage.id,
      index,
    })),
  );

  /*
   * S2→S3 ScrollTrigger runtime — ownership / lifecycle only.
   * Rebinds when stillLifeSrcDep changes (concentration ↔ Architecture asset).
   * Safely no-ops when section DOM is absent or src is empty.
   */
  useEffect(() => {
    if (layoutDep === "split") return;
    if (!stillLifeSrcDep) return;

    const section = sectionRef.current;
    if (!section) return;

    const continuous =
      motionModeDep === "continuous" &&
      window.matchMedia("(min-width: 701px)").matches;
    const setup = continuous
      ? setupS2S3HandoffRuntimeContinuous
      : setupS2S3HandoffRuntime;

    const ac = new AbortController();
    let cleanup: (() => void) | undefined;

    void setup({
      section,
      reduceMotion: reduceMotionDep,
      signal: ac.signal,
    }).then((teardown) => {
      if (ac.signal.aborted) {
        teardown();
        return;
      }
      cleanup = teardown;
    });

    return () => {
      ac.abort();
      cleanup?.();
    };
  }, [reduceMotionDep, stillLifeSrcDep, motionModeDep, layoutDep]);

  useEffect(() => {
    if (isSplit) {
      setSweeping(false);
      if (phase !== "composition") setExploreId(null);
      return;
    }
    const prev = prevPhaseRef.current;
    prevPhaseRef.current = phase;
    if (phase !== "composition") {
      setExploreId(null);
      setSweeping(false);
      return;
    }
    if (prev === "composition") return;
    if (reduceMotion) {
      setSweeping(false);
      return;
    }
    setSweeping(true);
    const t = window.setTimeout(() => setSweeping(false), COMPOSITION_SWEEP_MS);
    return () => window.clearTimeout(t);
  }, [phase, reduceMotion, isSplit]);

  const selectPhase = (id: PhaseId) => {
    if (isSplit && onDrivenPhaseChange) {
      onDrivenPhaseChange(id);
    } else {
      setInternalPhase(id);
    }
    setPanelTick((n) => n + 1);
    setExploreId(null);
  };

  if (!stillLifeSrc || !stages.length) return null;

  const index = architecture?.index ?? "04";
  const eyebrow = architecture?.eyebrow ?? "Arquitectura Olfativa";
  const isComposition = phase === "composition";
  const splitState: SplitOlfactoryState | null = isSplit
    ? splitStateFromPhase(phase)
    : null;
  const activeStage = isComposition
    ? null
    : (stages.find((s) => s.id === phase) ?? stages[0]);
  const navMeta = PHASE_NAV.find((n) => n.id === phase);
  const signature = activeStage
    ? signatureForStage(activeStage.id, signatureNotes)
    : undefined;
  const signatureName =
    signature?.note.name ?? activeStage?.notes[0]?.name ?? "";
  const traits = activeStage?.traits;
  const noteList = activeStage?.notes ?? [];
  const composition = architecture?.composition;
  const maxNotes = Math.max(...stages.map((s) => s.notes.length), 7);

  const exploreNote = exploreId
    ? flatNotes.find((n) => n.id === exploreId)
    : null;

  let emphasisMode: "phase" | "composition" | "explore" | "off" = "phase";
  let highlights: ArchitectureHighlight[] = activeStage?.highlights ?? [];

  if (isSplit) {
    emphasisMode = "off";
    highlights = [];
  } else if (isComposition) {
    if (exploreNote?.note.map) {
      const m = resolveMap(exploreNote.note.map);
      emphasisMode = "explore";
      highlights = [
        {
          cx: m.hotspotX,
          cy: m.hotspotY,
          rx: Math.max(m.hotspotW * 0.7, 8),
          ry: Math.max(m.hotspotH * 0.7, 8),
        },
      ];
    } else {
      emphasisMode = "composition";
      highlights = [
        { cx: 20, cy: 48, rx: 22, ry: 32 },
        { cx: 80, cy: 46, rx: 20, ry: 24 },
        { cx: 54, cy: 78, rx: 24, ry: 18 },
        { cx: 50, cy: 42, rx: 12, ry: 18 },
      ];
    }
  }

  const revealFor = (flat: FlatNote): RevealState => {
    if (isSplit) {
      if (isComposition) return "dormant";
      return flat.stageId === phase ? "active" : "dormant";
    }
    if (isComposition) {
      return exploreId === flat.id ? "explore" : "dormant";
    }
    return flat.stageId === phase ? "active" : "dormant";
  };

  /*
   * Rail hide rule:
   * - Salida (left annotation cluster) → conceal
   * - Composición explore with left-side label → conceal
   * - Corazón / Fondo / Composición default → show
   */
  const railConceal = (() => {
    if (isSplit) return false;
    if (phase === "top") return true;
    if (isComposition && exploreNote?.note.map) {
      const m = resolveMap(exploreNote.note.map);
      return m.labelX <= 42 || (m.align === "left" && m.anchorX < 58);
    }
    return false;
  })();

  return (
    <section
      ref={sectionRef}
      className="archive-section olfactory-architecture olfactory-architecture--atlas"
      aria-labelledby="architecture-title"
      data-phase={phase}
      data-sweeping={sweeping ? "true" : "false"}
      data-exploring={exploreId ? "true" : "false"}
      data-rail-conceal={railConceal ? "true" : "false"}
      data-reduce-motion={reduceMotion ? "true" : "false"}
      data-layout={isSplit ? "split" : "current"}
      data-split-state={splitState ?? undefined}
      data-page-chapter="04"
    >
      <div className="arch-atlas__scene">
        <div className="arch-atlas__atmosphere" aria-hidden="true">
          <Image
            src={sectionBackgroundSrc!}
            alt=""
            fill
            sizes={isSplit ? "66vw" : "100vw"}
            className="arch-atlas__atmosphere-image"
            quality={100}
            /* Serve original bytes — no optimizer recompress/resize derivative */
            unoptimized
            priority
          />
          <div className="arch-atlas__atmosphere-veil" />
        </div>

        <div className="arch-atlas__viewport">
          <div className="arch-atlas__canvas">
            <div className="arch-atlas__visual">
              {/*
               * Stage wraps media + annotations. Annotations live OUTSIDE the
               * aspect-ratio media box so edge labels/leaders are never clipped.
               */}
              <div className="arch-atlas__stage">
                <div
                  ref={mediaRef}
                  className="arch-atlas__media"
                  data-exploring={exploreId ? "true" : "false"}
                  style={
                    {
                      "--still-life-src": `url("${stillLifeSrc}")`,
                    } as CSSProperties
                  }
                  onClick={(e) => {
                    if (!isComposition) return;
                    if (e.target === e.currentTarget) setExploreId(null);
                  }}
                >
                  {isSplit ? (
                    <>
                      <div className="arch-atlas__still">
                        <Image
                          src={stillLifeSrc}
                          alt={architecture?.stillLifeAlt ?? ""}
                          fill
                          sizes="(max-width: 1023px) 100vw, 66vw"
                          className="arch-atlas__image"
                          quality={100}
                          unoptimized
                          priority
                        />
                      </div>
                      {!isComposition && splitState ? (
                        <div
                          className="arch-atlas__split-light"
                          data-state={splitState}
                          aria-hidden="true"
                        />
                      ) : null}
                      {!isComposition &&
                      splitState &&
                      splitState !== "composition" &&
                      noteList.length ? (
                        <SplitSpatialNotes
                          state={splitState}
                          notes={noteList}
                          traits={traits}
                          noteRows={activeStage?.noteRows}
                          reduceMotion={Boolean(reduceMotion)}
                        />
                      ) : null}
                    </>
                  ) : (
                    <>
                  <div className="arch-atlas__bloom" aria-hidden="true" />
                  <Image
                    src={stillLifeSrc}
                    alt={architecture?.stillLifeAlt ?? ""}
                    fill
                    sizes="(max-width: 900px) 100vw, 68vw"
                    className="arch-atlas__image"
                    quality={100}
                    /* Highest available source as-is — avoid optimizer derivatives */
                    unoptimized
                    priority
                  />

                    <PhaseEmphasis
                      highlights={highlights}
                      uid={uid}
                      mode={emphasisMode}
                    />
                    </>
                  )}

                  <CompositionSweep active={sweeping} />

                  <div className="arch-atlas__dissolve" aria-hidden="true" />

                  {/* COMPOSICIÓN explore hotspots — canonical only */}
                  {isComposition && !isSplit ? (
                    <div className="arch-atlas__hotspots">
                      {[...flatNotes]
                        .filter((flat) => flat.note.map)
                        .sort((a, b) => {
                          const ma = resolveMap(a.note.map!);
                          const mb = resolveMap(b.note.map!);
                          return (
                            ma.hotspotW * ma.hotspotH - mb.hotspotW * mb.hotspotH
                          );
                        })
                        .map((flat) => {
                          const m = resolveMap(flat.note.map!);
                          const active = exploreId === flat.id;
                          return (
                            <button
                              key={flat.id}
                              type="button"
                              className="arch-atlas__hotspot"
                              data-active={active ? "true" : "false"}
                              aria-label={flat.note.name}
                              style={
                                {
                                  left: `${m.hotspotX}%`,
                                  top: `${m.hotspotY}%`,
                                  width: `${m.hotspotW}%`,
                                  height: `${m.hotspotH}%`,
                                } as CSSProperties
                              }
                              onPointerEnter={(e) => {
                                if (e.pointerType === "mouse") {
                                  setExploreId(flat.id);
                                }
                              }}
                              onPointerLeave={(e) => {
                                if (e.pointerType === "mouse") {
                                  setExploreId((cur) =>
                                    cur === flat.id ? null : cur,
                                  );
                                }
                              }}
                              onFocus={() => setExploreId(flat.id)}
                              onBlur={() =>
                                setExploreId((cur) =>
                                  cur === flat.id ? null : cur,
                                )
                              }
                              onClick={(e) => {
                                e.stopPropagation();
                                if (e.nativeEvent instanceof PointerEvent) {
                                  const type = e.nativeEvent.pointerType;
                                  if (type === "touch" || type === "pen") {
                                    setExploreId((cur) =>
                                      cur === flat.id ? null : flat.id,
                                    );
                                    return;
                                  }
                                }
                                if (
                                  window.matchMedia("(hover: none)").matches
                                ) {
                                  setExploreId((cur) =>
                                    cur === flat.id ? null : flat.id,
                                  );
                                  return;
                                }
                                setExploreId(flat.id);
                              }}
                            />
                          );
                        })}
                    </div>
                  ) : null}
                </div>

                {isSplit ? null : (
                  <ul className="arch-atlas__annotations" aria-hidden="true">
                    {flatNotes.map((flat) => (
                      <Annotation
                        key={flat.id}
                        note={flat.note}
                        reveal={revealFor(flat)}
                        featured={
                          !isComposition && flat.note.name === signatureName
                        }
                        index={flat.index}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <aside className="arch-atlas__panel">
              <header className="arch-atlas__panel-head">
                <h2
                  id="architecture-title"
                  className={isSplit ? "sr-only" : "arch-atlas__meta"}
                >
                  <span className="arch-atlas__meta-index">{index}</span>
                  <span className="arch-atlas__meta-rule" aria-hidden="true" />
                  <span className="arch-atlas__meta-eyebrow">{eyebrow}</span>
                </h2>

                {isSplit ? (
                  <p className="sr-only" aria-live="polite">
                    {navMeta?.label}
                  </p>
                ) : null}

                {isSplit ? null : (
                  <div
                    className="arch-atlas__tabs"
                    role="tablist"
                    aria-label="Fases olfativas"
                    id={tablistId}
                  >
                    {PHASE_NAV.map((item) => {
                      const selected = item.id === phase;
                      const passed =
                        item.id !== "composition" &&
                        phase !== "composition" &&
                        phaseIndex(item.id) < phaseIndex(phase);
                      return (
                        <button
                          key={item.id}
                          type="button"
                          role="tab"
                          id={`${tablistId}-${item.id}`}
                          aria-selected={selected}
                          className="arch-atlas__tab"
                          data-active={selected ? "true" : "false"}
                          data-passed={passed ? "true" : "false"}
                          onClick={() => selectPhase(item.id)}
                        >
                          <span className="arch-atlas__tab-index">
                            {item.index}
                          </span>
                          <span className="arch-atlas__tab-label">
                            {item.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </header>

              {isSplit ? null : (
              <div
                className="arch-atlas__body"
                role="tabpanel"
                aria-labelledby={`${tablistId}-${phase}`}
                style={
                  {
                    "--note-slots": maxNotes,
                  } as CSSProperties
                }
              >
                <div
                  key={panelTick}
                  className="arch-atlas__body-inner"
                  data-kind={isComposition ? "composition" : "phase"}
                >
                  <p className="arch-atlas__phase-line">
                    <span className="arch-atlas__phase-index">
                      {navMeta?.index}
                    </span>
                    <span className="arch-atlas__phase-sep" aria-hidden="true">
                      —
                    </span>
                    <span className="arch-atlas__phase-label">
                      {navMeta?.label}
                    </span>
                  </p>

                  {isComposition ? (
                    <>
                      <p className="arch-atlas__traits arch-atlas__traits--reading">
                        {composition?.reading ??
                          "Tres movimientos de una sola composición."}
                      </p>
                      {composition?.taxonomy ? (
                        <p className="arch-atlas__taxonomy">
                          {composition.taxonomy}
                        </p>
                      ) : null}
                      <ul
                        className="arch-atlas__note-list arch-atlas__note-list--empty"
                        aria-hidden="true"
                      />
                    </>
                  ) : (
                    <>
                      <p className="arch-atlas__traits">{traits ?? "\u00a0"}</p>
                      <ul className="arch-atlas__note-list">
                        {noteList.map((note) => (
                          <li
                            key={note.name}
                            data-featured={
                              note.name === signatureName ? "true" : "false"
                            }
                          >
                            {note.name}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
