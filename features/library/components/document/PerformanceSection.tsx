"use client";

import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useReducedMotion } from "motion/react";
import type {
  ContinuumReading,
  PerformancePresentation,
  SpectrumReading,
} from "../../lib/presentation";
import {
  formatContinuumMarker,
  formatHoursRange,
} from "../../lib/presentation";
import {
  createMatterField,
  type MatterMode,
} from "./performanceMatter";
import { EditorialNo23Note } from "./EditorialNo23Note";
import { PerformanceVariantSwitch } from "./performance/PerformanceVariantSwitch";
import { setupPerformanceRuntime } from "./performanceRuntime";


type PerformanceSectionProps = {
  performance?: PerformancePresentation;
  /** Cinematic smoke film — Performance opening (not a separate chapter). */
  smokeFilmSrc?: string;
  /** Prototype split — static ivory editorial, no cinematic runtime. */
  layout?: "current" | "split";
  /** Temporary A/B/C experiments. Null keeps current SplitPerformance. */
  variant?: "A" | "B" | "C" | "C1" | "C3" | null;
};

type ContinuumKey = "longevity" | "projection" | "sillage" | "versatility";

const CONTINUUM_META: Record<
  ContinuumKey,
  { index: string; defaults: [string, string] }
> = {
  longevity: { index: "01 — LONGEVIDAD", defaults: ["Corta", "Larga"] },
  projection: { index: "02 — PROYECCIÓN", defaults: ["Piel", "Amplia"] },
  sillage: { index: "03 — SILLAGE", defaults: ["Contenida", "Marcada"] },
  versatility: {
    index: "06 — VERSATILIDAD",
    defaults: ["Especializada", "Muy versátil"],
  },
};

/**
 * Immersive Performance chapter (master template).
 * First discovery may open with Smoke → matter → metrics → Overview.
 * Settled: panoramic Overview plate only (no Smoke replay).
 */
export function PerformanceSection({
  performance,
  smokeFilmSrc,
  layout = "current",
  variant = null,
}: PerformanceSectionProps) {
  const reduceMotion = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isSplit = layout === "split";

  const longevity = performance?.longevity;
  const projection = performance?.projection;
  const sillage = performance?.sillage;
  const versatility = performance?.versatility;
  const seasons = performance?.seasons;
  const occasions = performance?.occasions;

  useEffect(() => {
    if (isSplit) return;
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas || !longevity) return;

    const seasonWeights = spectrumToWeights(seasons);
    const occasionWeights = spectrumToWeights(occasions);

    const positionFor = (mode: MatterMode): number => {
      switch (mode) {
        case "longevity":
          return longevity.position ?? 0.7;
        case "projection":
          return projection?.position ?? 0.5;
        case "sillage":
          return sillage?.position ?? 0.45;
        case "versatility":
        case "overview":
          return versatility?.position ?? 0.65;
        default:
          return 0.55;
      }
    };

    const weightsFor = (
      mode: MatterMode,
    ): [number, number, number, number] => {
      if (mode === "season") return seasonWeights;
      if (mode === "occasion") return occasionWeights;
      return seasonWeights;
    };

    const field = createMatterField(canvas, {
      position: positionFor("longevity"),
      weights: seasonWeights,
      reducedMotion: Boolean(reduceMotion),
      build: reduceMotion ? 1 : 0,
      mode: "longevity",
    });

    const onResize = () => field.resize();
    window.addEventListener("resize", onResize);

    const ac = new AbortController();
    let cleanupRuntime: (() => void) | undefined;

    const onOverviewFocus = (event: Event) => {
      const item = (event.target as HTMLElement | null)?.closest(
        ".performance-overview__item",
      );
      if (!(item instanceof HTMLElement)) return;
      const metric = (item.dataset.metric || "overview") as MatterMode;
      section
        .querySelectorAll<HTMLElement>(".performance-overview__item")
        .forEach((node) => {
          node.dataset.focus = node === item ? "true" : "false";
        });
      field.setState({
        mode: metric,
        build: 1,
        morph: 0,
        position: positionFor(metric),
        weights: weightsFor(metric),
      });
    };
    const onOverviewBlur = (event: Event) => {
      const next = (event as PointerEvent).relatedTarget;
      if (next instanceof Node && section.contains(next)) {
        const item = (next as HTMLElement).closest?.(
          ".performance-overview__item",
        );
        if (item) return;
      }
      section
        .querySelectorAll<HTMLElement>(".performance-overview__item")
        .forEach((node) => {
          delete node.dataset.focus;
        });
      field.setState({
        mode: "overview",
        build: 0.35,
        morph: 0,
        position: positionFor("overview"),
        weights: weightsFor("overview"),
      });
    };
    section.addEventListener("pointerover", onOverviewFocus);
    section.addEventListener("focusin", onOverviewFocus);
    section.addEventListener("pointerout", onOverviewBlur);
    section.addEventListener("focusout", onOverviewBlur);

    void setupPerformanceRuntime({
      section,
      reduceMotion: Boolean(reduceMotion),
      signal: ac.signal,
      onField: ({ build, breathe, mode, morph }) => {
        field.setState({
          build,
          breathe,
          mode,
          morph,
          position: positionFor(mode),
          weights: weightsFor(mode),
        });
      },
    }).then((teardown) => {
      if (ac.signal.aborted) {
        teardown();
        return;
      }
      cleanupRuntime = teardown;
    });

    return () => {
      ac.abort();
      cleanupRuntime?.();
      window.removeEventListener("resize", onResize);
      section.removeEventListener("pointerover", onOverviewFocus);
      section.removeEventListener("focusin", onOverviewFocus);
      section.removeEventListener("pointerout", onOverviewBlur);
      section.removeEventListener("focusout", onOverviewBlur);
      field.destroy();
    };
  }, [
    longevity,
    projection,
    sillage,
    versatility,
    seasons,
    occasions,
    reduceMotion,
    isSplit,
  ]);

  if (!longevity?.reading) return null;

  if (isSplit) {
    return (
      <PerformanceVariantSwitch
        performance={performance}
        smokeFilmSrc={smokeFilmSrc}
        variant={variant}
      />
    );
  }

  return (
    <section
      ref={sectionRef}
      className="performance-section performance-section--immersive"
      aria-labelledby="performance-title"
      data-perf-phase="idle"
      style={
        {
          "--perf-target": String(
            Math.min(1, Math.max(0, longevity.position ?? 0.7)),
          ),
        } as CSSProperties
      }
    >
      <div className="performance-section__stage">
        {smokeFilmSrc ? (
          <div className="performance-section__smoke" aria-hidden="true">
            <video
              className="performance-section__smoke-video"
              src={smokeFilmSrc}
              muted
              loop
              playsInline
              preload="auto"
              tabIndex={-1}
            />
            <div className="performance-section__smoke-veil" />
          </div>
        ) : null}

        <canvas
          ref={canvasRef}
          className="performance-section__matter"
          aria-hidden="true"
        />
        <div className="performance-section__atmosphere" aria-hidden="true" />

        <div className="performance-section__chrome">
          <div className="performance-section__chrome-bar">
            <p
              className="performance-section__chapter"
              style={{ opacity: "var(--perf-intro, 0)" }}
            >
              <span>05</span>
              <span
                className="performance-section__chapter-rule"
                aria-hidden="true"
              >
                /
              </span>
              <span>PERFORMANCE</span>
            </p>
            <EditorialNo23Note variant="performance" />
          </div>

          <div
            className="performance-section__identity"
            style={{ opacity: "var(--perf-identity, 0)" }}
            aria-hidden="true"
          >
            <p className="performance-section__identity-kicker">Performance</p>
            <p className="performance-section__identity-lede">
              Comportamiento y contexto de uso
            </p>
          </div>

          <h2 id="performance-title" className="sr-only">
            Performance
          </h2>

          <div className="performance-section__body">
            <div className="performance-section__exhibits">
              {longevity ? (
                <ContinuumExhibit metric="longevity" reading={longevity} />
              ) : null}
              {projection ? (
                <ContinuumExhibit metric="projection" reading={projection} />
              ) : null}
              {sillage ? (
                <ContinuumExhibit metric="sillage" reading={sillage} />
              ) : null}
              {seasons ? (
                <SpectrumExhibit
                  metric="season"
                  indexLabel="04 — ESTACIÓN"
                  reading={seasons}
                />
              ) : null}
              {occasions ? (
                <SpectrumExhibit
                  metric="occasion"
                  indexLabel="05 — OCASIÓN"
                  reading={occasions}
                />
              ) : null}
              {versatility ? (
                <ContinuumExhibit metric="versatility" reading={versatility} />
              ) : null}
            </div>

            <PerformanceOverview performance={performance} />
          </div>
        </div>
      </div>
    </section>
  );
}


function spectrumWeight(
  reading: SpectrumReading,
  index: number,
  label: string,
): number {
  const w = reading.weights?.[index];
  if (typeof w === "number") return Math.min(1, Math.max(0, w));
  return reading.active.includes(label) ? 0.88 : 0.22;
}

function spectrumToWeights(
  reading?: SpectrumReading,
): [number, number, number, number] {
  if (!reading) return [0.5, 0.5, 0.5, 0.5];
  const out = [0, 1, 2, 3].map((i) =>
    spectrumWeight(reading, i, reading.spectrum[i] ?? ""),
  );
  return [out[0], out[1], out[2], out[3]];
}

function ContinuumExhibit({
  metric,
  reading,
}: {
  metric: ContinuumKey;
  reading: ContinuumReading;
}) {
  const meta = CONTINUUM_META[metric];
  const poles = reading.poles ?? meta.defaults;
  const marker = formatContinuumMarker(reading, metric === "longevity");
  const target = Math.min(1, Math.max(0, reading.position ?? 0.7));

  return (
    <div
      className="performance-exhibit"
      data-metric={metric}
      style={{ opacity: `var(--perf-vis-${metric}, 0)` }}
    >
      <header className="performance-exhibit__head">
        <p className="performance-exhibit__index">{meta.index}</p>
        <p className="performance-exhibit__reading">{reading.reading}</p>
      </header>

      <PerformanceRail
        poles={poles}
        marker={marker}
        target={target}
        compound={metric === "longevity" && Boolean(reading.hoursRange)}
        ariaLabel={`${meta.index}: ${marker}. De ${poles[0]} a ${poles[1]}.`}
      />
    </div>
  );
}

function SpectrumExhibit({
  metric,
  indexLabel,
  reading,
}: {
  metric: "season" | "occasion";
  indexLabel: string;
  reading: SpectrumReading;
}) {
  const items = reading.spectrum.slice(0, 4);

  return (
    <div
      className="performance-exhibit performance-exhibit--spectrum"
      data-metric={metric}
      style={{ opacity: `var(--perf-vis-${metric}, 0)` }}
    >
      <header className="performance-exhibit__head">
        <p className="performance-exhibit__index">{indexLabel}</p>
        <p className="performance-exhibit__reading">{reading.reading}</p>
      </header>

      <ul
        className="performance-spectrum"
        role="list"
        aria-label={`${indexLabel}: ${reading.reading}`}
      >
        {items.map((label, i) => {
          const weight = spectrumWeight(reading, i, label);
          const on = weight >= 0.4;
          return (
            <li
              key={label}
              className="performance-spectrum__row"
              data-active={on ? "true" : "false"}
            >
              <span className="performance-spectrum__label">{label}</span>
              <span className="performance-spectrum__track">
                <span
                  className="performance-spectrum__fill"
                  style={{
                    transform: `scaleX(calc(var(--perf-fill, 0) * ${weight}))`,
                  }}
                />
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * PerformanceRail — qualitative instrument track.
 * Patterns borrowed from 21st/Cult/Motion research; adapted to NO.23 CSS vars.
 */
function PerformanceRail({
  poles,
  marker,
  target,
  ariaLabel,
  settled = false,
  compound = false,
}: {
  poles: [string, string];
  marker: string;
  target: number;
  ariaLabel: string;
  settled?: boolean;
  compound?: boolean;
}) {
  const fillExpr = settled
    ? String(target)
    : `calc(var(--perf-fill, 0) * ${target})`;
  const leftExpr = settled
    ? `${target * 100}%`
    : `calc(var(--perf-fill, 0) * ${target * 100}%)`;
  const labelOp = settled ? 1 : "var(--perf-label, 0)";

  return (
    <div
      className="performance-rail"
      data-settled={settled ? "true" : "false"}
      data-compound={compound ? "true" : "false"}
      role="img"
      aria-label={ariaLabel}
    >
      <span className="performance-rail__pole">{poles[0]}</span>
      <div className="performance-rail__track">
        <span className="performance-rail__line" />
        <span
          className="performance-rail__fill"
          style={{ transform: `scaleX(${fillExpr})` }}
        />
        <span className="performance-rail__node" style={{ left: leftExpr }}>
          <span className="performance-rail__node-core" />
          <span className="performance-rail__node-glow" aria-hidden="true" />
        </span>
        <span
          className="performance-rail__marker"
          style={{ left: leftExpr, opacity: labelOp }}
        >
          {marker}
        </span>
      </div>
      <span className="performance-rail__pole">{poles[1]}</span>
    </div>
  );
}

function PerformanceOverview({
  performance,
}: {
  performance?: PerformancePresentation;
}) {
  if (!performance) return null;

  /* Explicit 3×2 order: top longevity/projection/sillage, bottom season/occasion/versatility */
  const cells: {
    id: string;
    label: string;
    hours?: string | null;
    reading?: string;
    body: ReactNode;
  }[] = [];

  if (performance.longevity) {
    const r = performance.longevity;
    const hours = formatHoursRange(r.hoursRange);
    cells.push({
      id: "longevity",
      label: "01 Longevidad",
      hours,
      reading: r.reading,
      body: (
        <PerformanceRail
          poles={r.poles ?? ["Corta", "Larga"]}
          marker={formatContinuumMarker(r, false)}
          target={r.position ?? 0.7}
          ariaLabel={
            hours
              ? `${r.reading}. ${formatContinuumMarker(r, true)}`
              : r.reading
          }
          settled
        />
      ),
    });
  }
  if (performance.projection) {
    const r = performance.projection;
    cells.push({
      id: "projection",
      label: "02 Proyección",
      reading: r.reading,
      body: (
        <PerformanceRail
          poles={r.poles ?? ["Piel", "Amplia"]}
          marker={r.marker ?? r.reading}
          target={r.position ?? 0.5}
          ariaLabel={r.reading}
          settled
        />
      ),
    });
  }
  if (performance.sillage) {
    const r = performance.sillage;
    cells.push({
      id: "sillage",
      label: "03 Sillage",
      reading: r.reading,
      body: (
        <PerformanceRail
          poles={r.poles ?? ["Contenida", "Marcada"]}
          marker={r.marker ?? r.reading}
          target={r.position ?? 0.45}
          ariaLabel={r.reading}
          settled
        />
      ),
    });
  }
  if (performance.seasons) {
    cells.push({
      id: "season",
      label: "04 Estación",
      reading: performance.seasons.reading,
      body: (
        <OverviewSpectrum
          reading={performance.seasons}
          ariaLabel={performance.seasons.reading}
        />
      ),
    });
  }
  if (performance.occasions) {
    cells.push({
      id: "occasion",
      label: "05 Ocasión",
      reading: performance.occasions.reading,
      body: (
        <OverviewSpectrum
          reading={performance.occasions}
          ariaLabel={performance.occasions.reading}
        />
      ),
    });
  }
  if (performance.versatility) {
    const r = performance.versatility;
    cells.push({
      id: "versatility",
      label: "06 Versatilidad",
      reading: r.reading,
      body: (
        <PerformanceRail
          poles={r.poles ?? ["Especializada", "Muy versátil"]}
          marker={r.marker ?? r.reading}
          target={r.position ?? 0.65}
          ariaLabel={r.reading}
          settled
        />
      ),
    });
  }

  if (!cells.length) return null;

  return (
    <div
      className="performance-overview"
      style={{
        /* Shell rises early; items stagger via --perf-overview in CSS. */
        opacity: "clamp(0, calc(var(--perf-overview, 0) / 0.16), 1)",
      }}
    >
      <header className="performance-overview__head">
        <p className="performance-overview__eyebrow">Performance overview</p>
        <p className="performance-overview__title">Cómo se comporta</p>
      </header>
      <ul className="performance-overview__grid" role="list">
        {cells.map((cell) => (
          <li
            key={cell.id}
            className="performance-overview__item"
            data-metric={cell.id}
            tabIndex={0}
          >
            <p className="performance-overview__label">
              {cell.label}
              {cell.hours ? (
                <span className="performance-overview__hours">{cell.hours}</span>
              ) : null}
            </p>
            <p className="performance-overview__reading">{cell.reading}</p>
            {cell.body}
          </li>
        ))}
      </ul>
      {performance.lectura ? (
        <div className="performance-overview__coda">
          <PerformanceLectura text={performance.lectura} />
        </div>
      ) : null}
    </div>
  );
}

function PerformanceLectura({ text }: { text: string }) {
  return (
    <div className="performance-lectura">
      <p className="performance-lectura__eyebrow">Lectura NO.23</p>
      <p className="performance-lectura__body">{text}</p>
    </div>
  );
}

function OverviewSpectrum({
  reading,
  ariaLabel,
}: {
  reading: SpectrumReading;
  ariaLabel: string;
}) {
  return (
    <ul
      className="performance-spectrum performance-spectrum--mini"
      role="list"
      aria-label={ariaLabel}
    >
      {reading.spectrum.slice(0, 4).map((label, i) => {
        const weight = spectrumWeight(reading, i, label);
        const on = weight >= 0.4;
        return (
          <li
            key={label}
            className="performance-spectrum__row"
            data-active={on ? "true" : "false"}
          >
            <span className="performance-spectrum__label">{label}</span>
            <span className="performance-spectrum__track">
              <span
                className="performance-spectrum__fill"
                style={{ transform: `scaleX(${weight})` }}
              />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
