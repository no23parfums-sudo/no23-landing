"use client";

import {
  motion,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { PerformancePresentation } from "../../../lib/presentation";
import {
  buildPerformanceVariantModel,
  discreteLevel,
  PROJECTION_MARKS,
  seasonKind,
  SILLAGE_MARKS,
  spectrumWeight,
  splitEditorialReading,
} from "../../../lib/performanceVariantModel";
import {
  resolveUsageMoments,
  type UsageMomentId,
} from "../../../lib/usageMoments";
import {
  copyAssemble,
  editorialViewport,
  hairlineAssemble,
  plateAssemble,
} from "../sceneHandoff";

type SplitPerformanceSheetProps = {
  performance?: PerformancePresentation;
};

const easeOut = [0.22, 1, 0.36, 1] as const;
const FILL_MS = 0.7;

function displayMarker(value: string | null | undefined, fallback = "—") {
  return (value ?? fallback).trim().toLocaleUpperCase("es-ES");
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/** Duration scale: 0h = Corta, 6h = Media, 12h = Larga. */
function hoursOnScale(hours: number) {
  return clamp01(hours / 12);
}

function sentence(text: string) {
  const t = text.trim();
  if (!t) return t;
  const capped = t.charAt(0).toLocaleUpperCase("es-ES") + t.slice(1);
  return /[.!?…]$/.test(capped) ? capped : `${capped}.`;
}

/**
 * Compact editorial Performance sheet — split experiment only.
 * Contained data panel. Does not run on the master immersive chapter.
 */
export function SplitPerformanceSheet({
  performance,
}: SplitPerformanceSheetProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, editorialViewport);
  const play = reduceMotion || inView;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const exitOpacity = useTransform(scrollYProgress, [0.52, 1], [1, 0.9]);
  const exitY = useTransform(scrollYProgress, [0.52, 1], [0, -6]);
  const model = performance
    ? buildPerformanceVariantModel(performance)
    : null;

  if (!model) return null;

  const seasonCopy = model.seasons
    ? splitEditorialReading(model.seasons.reading)
    : null;
  const momentReading = resolveUsageMoments(performance);
  const accent = performance?.accent;
  const hasHours = model.hoursMin != null && model.hoursMax != null;
  const longevityRange = hasHours
    ? {
        start: hoursOnScale(model.hoursMin!),
        end: hoursOnScale(model.hoursMax!),
      }
    : {
        start: clamp01(model.longevityPosition - 0.04),
        end: clamp01(model.longevityPosition + 0.04),
      };

  return (
    <section
      ref={sectionRef}
      className="performance-section perf-sheet"
      aria-labelledby="performance-sheet-title"
      style={
        accent
          ? ({ ["--perf-sheet-accent"]: accent } as CSSProperties)
          : undefined
      }
    >
      <motion.div
        className="perf-sheet__exit"
        style={
          reduceMotion ? undefined : { opacity: exitOpacity, y: exitY }
        }
      >
      <motion.div
        className="perf-sheet__panel"
        initial={reduceMotion ? false : "hidden"}
        animate={play ? "show" : "hidden"}
        variants={reduceMotion ? undefined : plateAssemble()}
      >
        <motion.span
          className="perf-sheet__hairline"
          aria-hidden="true"
          variants={reduceMotion ? undefined : hairlineAssemble(0.08)}
        />
        <header className="perf-sheet__intro">
          <motion.div
            className="perf-sheet__intro-row"
            variants={reduceMotion ? undefined : copyAssemble(0.18, 8)}
          >
            <p className="perf-sheet__eyebrow">Performance</p>
            <SheetMethodology />
          </motion.div>
          <motion.h2
            id="performance-sheet-title"
            className="perf-sheet__title"
            variants={reduceMotion ? undefined : copyAssemble(0.24, 10)}
          >
            Cómo se comporta
          </motion.h2>
          <motion.p
            className="perf-sheet__lede"
            variants={reduceMotion ? undefined : copyAssemble(0.3, 8)}
          >
            Una lectura rápida de su presencia, duración y versatilidad.
          </motion.p>
        </header>

        <motion.ul
          className="perf-sheet__metrics"
          variants={reduceMotion ? undefined : copyAssemble(0.38, 8)}
        >
          <MetricCell
            label="Longevidad"
            ariaLabel={`Longevidad: ${model.hours ?? model.longevityReading}`}
            value={
              hasHours ? (
                <HoursValue min={model.hoursMin!} max={model.hoursMax!} />
              ) : (
                displayMarker(model.longevityReading)
              )
            }
            poles={["0h", "12h"]}
          >
            <LongevityTime
              start={longevityRange.start}
              end={longevityRange.end}
              play={play}
              reduce={reduceMotion}
            />
          </MetricCell>
          <MetricCell
            label="Proyección"
            ariaLabel={`Proyección: ${model.projectionMarker ?? model.projectionReading}`}
            value={displayMarker(model.projectionMarker)}
            poles={PROJECTION_MARKS.map((m) => m.label)}
          >
            <ProjectionReach
              amount={clamp01(model.projectionPosition)}
              play={play}
              reduce={reduceMotion}
            />
          </MetricCell>
          <MetricCell
            label="Estela"
            ariaLabel={`Estela: ${model.sillageMarker ?? model.sillageReading}`}
            value={displayMarker(model.sillageMarker)}
            poles={SILLAGE_MARKS.map((m) => m.label)}
          >
            <SillageWake
              amount={clamp01(model.sillagePosition)}
              play={play}
              reduce={reduceMotion}
            />
          </MetricCell>
          <MetricCell
            label="Versatilidad"
            ariaLabel={`Versatilidad: ${model.versatilityMarker ?? model.versatilityReading}`}
            value={displayMarker(model.versatilityMarker)}
            poles={model.versatilityPoles}
          >
            <VersatilityMark
              filled={discreteLevel(model.versatilityPosition, 5) + 1}
              play={play}
              reduce={reduceMotion}
            />
          </MetricCell>
        </motion.ul>

        <div className="perf-sheet__rule" aria-hidden="true" />

        <motion.div
          className="perf-sheet__context"
          variants={reduceMotion ? undefined : copyAssemble(0.46, 8)}
        >
          {model.seasons ? (
            <div className="perf-sheet__ctx">
              <p className="perf-sheet__ctx-label">Estación</p>
              <ul
                className="perf-sheet__facets"
                data-count="4"
                aria-label={model.seasons.reading}
              >
                {model.seasons.spectrum.slice(0, 4).map((label, i) => {
                  const weight = spectrumWeight(model.seasons!, i, label);
                  const kind = seasonKind(label, i);
                  return (
                    <li
                      key={label}
                      className="perf-sheet__facet"
                      data-season={kind}
                      style={{ ["--facet-w" as string]: String(weight) }}
                    >
                      <span className="perf-sheet__facet-ico-slot">
                        <SeasonGlyph kind={kind} />
                      </span>
                      <span className="perf-sheet__facet-name">{label}</span>
                      <AffinityBar
                        weight={weight}
                        play={play}
                        reduce={reduceMotion}
                        delay={0.32 + i * 0.06}
                      />
                    </li>
                  );
                })}
              </ul>
              <div className="perf-sheet__ctx-copy">
                {seasonCopy ? (
                  <p className="perf-sheet__ctx-primary">{seasonCopy.primary}</p>
                ) : null}
                {seasonCopy?.secondary ? (
                  <p className="perf-sheet__ctx-secondary">
                    {sentence(seasonCopy.secondary)}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          {momentReading ? (
            <div className="perf-sheet__ctx">
              <p className="perf-sheet__ctx-label">Momento</p>
              <ul
                className="perf-sheet__facets"
                data-count={String(momentReading.items.length)}
                aria-label={momentReading.reading}
              >
                {momentReading.items.map((item, i) => (
                  <li
                    key={item.id}
                    className="perf-sheet__facet"
                    data-moment={item.id}
                    style={{ ["--facet-w" as string]: String(item.score) }}
                  >
                    <span className="perf-sheet__facet-ico-slot">
                      <MomentGlyph id={item.id} />
                    </span>
                    <span className="perf-sheet__facet-name">{item.label}</span>
                    <AffinityBar
                      weight={item.score}
                      play={play}
                      reduce={reduceMotion}
                      delay={0.32 + i * 0.06}
                    />
                  </li>
                ))}
              </ul>
              <div className="perf-sheet__ctx-copy">
                <p className="perf-sheet__ctx-primary">{momentReading.reading}</p>
              </div>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
      </motion.div>
    </section>
  );
}

function HoursValue({ min, max }: { min: number; max: number }) {
  return (
    <span className="perf-sheet__hours">
      <span className="perf-sheet__hours-range">
        {min}–{max}
      </span>
      <span className="perf-sheet__hours-unit">h</span>
    </span>
  );
}

function MetricCell({
  label,
  value,
  ariaLabel,
  poles,
  children,
}: {
  label: string;
  value: ReactNode;
  ariaLabel: string;
  poles: string[];
  children: ReactNode;
}) {
  return (
    <li className="perf-sheet__metric">
      <p className="perf-sheet__label">{label}</p>
      <p className="perf-sheet__value">{value}</p>
      <div className="perf-sheet__viz" role="img" aria-label={ariaLabel}>
        {children}
      </div>
      <p className="perf-sheet__poles" data-count={String(poles.length)} aria-hidden="true">
        {poles.map((pole) => (
          <span key={pole}>{pole}</span>
        ))}
      </p>
    </li>
  );
}

function LongevityTime({
  start,
  end,
  play,
  reduce,
}: {
  start: number;
  end: number;
  play: boolean;
  reduce: boolean;
}) {
  const left = clamp01(Math.min(start, end));
  const width = Math.max(0.06, Math.abs(end - start));
  return (
    <div className="perf-sheet__time">
      <span className="perf-sheet__time-track">
        <motion.span
          className="perf-sheet__time-range"
          style={{ left: `${left * 100}%`, width: `${width * 100}%` }}
          initial={reduce ? false : { scaleX: 0 }}
          animate={play ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: FILL_MS, ease: easeOut }}
        />
      </span>
    </div>
  );
}

function ProjectionReach({
  amount,
  play,
  reduce,
}: {
  amount: number;
  play: boolean;
  reduce: boolean;
}) {
  return (
    <div className="perf-sheet__reach">
      <span className="perf-sheet__origin" aria-hidden="true" />
      <span className="perf-sheet__reach-track">
        <motion.span
          className="perf-sheet__reach-fill"
          style={{ width: `${Math.max(0.08, amount) * 100}%` }}
          initial={reduce ? false : { scaleX: 0 }}
          animate={play ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: FILL_MS, ease: easeOut }}
        />
      </span>
    </div>
  );
}

function SillageWake({
  amount,
  play,
  reduce,
}: {
  amount: number;
  play: boolean;
  reduce: boolean;
}) {
  return (
    <div className="perf-sheet__wake">
      <span className="perf-sheet__wake-track">
        <motion.span
          className="perf-sheet__wake-fill"
          style={{ width: `${Math.max(0.12, amount) * 100}%` }}
          initial={reduce ? false : { scaleX: 0 }}
          animate={play ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: FILL_MS, ease: easeOut }}
        />
      </span>
      <span className="perf-sheet__wake-source" aria-hidden="true" />
    </div>
  );
}

function VersatilityMark({
  filled,
  play,
  reduce,
}: {
  filled: number;
  play: boolean;
  reduce: boolean;
}) {
  return (
    <div className="perf-sheet__segments" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <motion.span
          key={i}
          className="perf-sheet__seg"
          data-on={i < filled ? "true" : "false"}
          initial={reduce ? false : { opacity: 0 }}
          animate={play ? { opacity: 1 } : { opacity: 0 }}
          transition={{ duration: 0.28, delay: 0.08 + i * 0.07, ease: easeOut }}
        />
      ))}
    </div>
  );
}

function AffinityBar({
  weight,
  play,
  reduce,
  delay,
}: {
  weight: number;
  play: boolean;
  reduce: boolean;
  delay: number;
}) {
  return (
    <span className="perf-sheet__aff-bar" aria-hidden="true">
      <motion.span
        className="perf-sheet__aff-fill"
        style={{ width: `${clamp01(weight) * 100}%` }}
        initial={reduce ? false : { scaleX: 0 }}
        animate={play ? { scaleX: 1 } : { scaleX: 0 }}
        transition={{ duration: FILL_MS, delay, ease: easeOut }}
      />
    </span>
  );
}

const METHOD_TITLE = "Lectura editorial NO.23";
const METHOD_BODY =
  "Los indicadores de performance expresan una interpretación cualitativa del comportamiento de la fragancia, elaborada a partir de fuentes especializadas, consenso de comunidad y criterio editorial. La experiencia puede variar según piel, aplicación, clima y entorno.";
const METHOD_FOOTER = "Fuentes · Editorial · Comunidad";
const HOVER_CLOSE_MS = 120;

function isFineHoverPointer() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function SheetMethodology() {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const clearCloseTimer = () => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openNow = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, HOVER_CLOSE_MS);
  };

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent | TouchEvent) => {
      if (isFineHoverPointer()) return;
      const root = rootRef.current;
      if (!root) return;
      if (event.target instanceof Node && !root.contains(event.target)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={rootRef}
      className="perf-sheet__method"
      data-open={open ? "true" : "false"}
      data-reduce-motion={reduceMotion ? "true" : "false"}
      onMouseEnter={() => {
        if (isFineHoverPointer()) openNow();
      }}
      onMouseLeave={() => {
        if (isFineHoverPointer()) scheduleClose();
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="perf-sheet__method-btn"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={(event) => {
          if (isFineHoverPointer()) {
            event.preventDefault();
            openNow();
            return;
          }
          setOpen((v) => !v);
        }}
        onFocus={() => openNow()}
        onBlur={(event) => {
          const next = event.relatedTarget;
          if (next instanceof Node && rootRef.current?.contains(next)) return;
          clearCloseTimer();
          setOpen(false);
        }}
      >
        <span>Editorial NO.23</span>
        <span className="perf-sheet__method-mark" aria-hidden="true">
          ⓘ
        </span>
      </button>
      <div
        id={panelId}
        className="perf-sheet__method-pop"
        role="dialog"
        aria-labelledby={`${panelId}-title`}
        hidden={!open}
        tabIndex={-1}
      >
        <p id={`${panelId}-title`} className="perf-sheet__method-title">
          {METHOD_TITLE}
        </p>
        <p className="perf-sheet__method-body">{METHOD_BODY}</p>
        <p className="perf-sheet__method-foot">{METHOD_FOOTER}</p>
      </div>
    </div>
  );
}

function SeasonGlyph({
  kind,
}: {
  kind: "spring" | "summer" | "autumn" | "winter";
}) {
  if (kind === "spring") {
    return (
      <svg viewBox="0 0 24 24" className="perf-sheet__facet-ico" aria-hidden="true">
        <path d="M12 20 V10" />
        <path d="M12 14 C8 14 7 9 10 8 C10 12 12 12 12 14" />
        <path d="M12 13 C16 13 17 8 14 7 C14 11 12 12 12 13" />
      </svg>
    );
  }
  if (kind === "summer") {
    return (
      <svg viewBox="0 0 24 24" className="perf-sheet__facet-ico" aria-hidden="true">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 4.5 V6.4 M12 17.6 V19.5 M4.5 12 H6.4 M17.6 12 H19.5 M6.6 6.6 L7.9 7.9 M16.1 16.1 L17.4 17.4 M17.4 6.6 L16.1 7.9 M7.9 16.1 L6.6 17.4" />
      </svg>
    );
  }
  if (kind === "autumn") {
    return (
      <svg viewBox="0 0 24 24" className="perf-sheet__facet-ico" aria-hidden="true">
        <path d="M12 19 C12 14 7 13 7 9 C10 9 12 12 12 12 C12 12 14 9 17 9 C17 13 12 14 12 19" />
        <path d="M12 12 V20" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" className="perf-sheet__facet-ico" aria-hidden="true">
      <path d="M12 5 V19 M7 8.5 L17 15.5 M17 8.5 L7 15.5" />
      <path d="M12 8 L10.5 6.2 M12 8 L13.5 6.2 M12 16 L10.5 17.8 M12 16 L13.5 17.8" />
    </svg>
  );
}

function MomentGlyph({ id }: { id: UsageMomentId }) {
  const common = {
    viewBox: "0 0 24 24",
    className: "perf-sheet__facet-ico",
    "aria-hidden": true as const,
  };
  if (id === "daily") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 4.8 V6.6 M12 17.4 V19.2 M4.8 12 H6.6 M17.4 12 H19.2" />
      </svg>
    );
  }
  if (id === "work") {
    return (
      <svg {...common}>
        <rect x="5" y="10" width="14" height="9" />
        <path d="M9 10 V8 H15 V10 M5 13.5 H19" />
      </svg>
    );
  }
  if (id === "night") {
    return (
      <svg {...common}>
        <path d="M14.5 6.2 C11 6.8 8.5 10 8.8 13.6 C9.2 17.2 12.4 19.8 16 19.4 C13.2 18.6 11.2 15.8 11.5 12.6 C11.7 10 12.8 7.8 14.5 6.2 Z" />
      </svg>
    );
  }
  if (id === "casual") {
    return (
      <svg {...common}>
        <path d="M8 8 L12 6 L16 8 L18 10 V19 H6 V10 Z" />
        <path d="M10 19 V13 H14 V19" />
      </svg>
    );
  }
  if (id === "date") {
    return (
      <svg {...common}>
        <circle cx="9" cy="10" r="2.2" />
        <circle cx="15" cy="10" r="2.2" />
        <path d="M7.8 13.2 C8.6 16.2 11 18 12 18 C13 18 15.4 16.2 16.2 13.2" />
      </svg>
    );
  }
  if (id === "party") {
    return (
      <svg {...common}>
        <path d="M12 5 V9 M12 15 V19 M5 12 H9 M15 12 H19 M7.2 7.2 L9.4 9.4 M14.6 14.6 L16.8 16.8 M16.8 7.2 L14.6 9.4 M9.4 14.6 L7.2 16.8" />
      </svg>
    );
  }
  if (id === "special_occasion") {
    return (
      <svg {...common}>
        <path d="M12 5 L14.2 10.2 L20 11 L15.8 14.8 L17 20.5 L12 17.6 L7 20.5 L8.2 14.8 L4 11 L9.8 10.2 Z" />
      </svg>
    );
  }
  if (id === "formal") {
    return (
      <svg {...common}>
        <path d="M7 19 V11 L12 7 L17 11 V19" />
        <path d="M7 19 H17 M10 19 V14 H14 V19" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M4.5 17 H19.5" />
      <path d="M12 17 V8 L8 13 H12" />
      <circle cx="16.5" cy="7.5" r="2" />
    </svg>
  );
}
