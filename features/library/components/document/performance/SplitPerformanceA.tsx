"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import type { PerformancePresentation } from "../../../lib/presentation";
import {
  LONGEVITY_MARKS,
  PROJECTION_MARKS,
  SILLAGE_MARKS,
  buildPerformanceVariantModel,
  spectrumWeight,
} from "../../../lib/performanceVariantModel";
import { PerformanceScale } from "../PerformanceScale";
import { PerfVariantVisual } from "./PerfVariantVisual";

const easeOut = [0.22, 1, 0.36, 1] as const;

type SplitPerformanceAProps = {
  performance?: PerformancePresentation;
  smokeFilmSrc?: string;
};

/**
 * Temporary experiment A — editorial split.
 * Sticky visual / scrolling reading. Does not replace production Section 4.
 */
export function SplitPerformanceA({
  performance,
  smokeFilmSrc,
}: SplitPerformanceAProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const model = performance ? buildPerformanceVariantModel(performance) : null;
  if (!model) return null;

  return (
    <section
      className="performance-section perf-v perf-a"
      aria-labelledby="performance-title-a"
      data-settled="true"
    >
      <PerfVariantVisual
        src={smokeFilmSrc}
        className="perf-a__visual"
        reduceMotion={reduceMotion}
      />

      <div className="perf-a__reading">
        <header className="perf-a__head">
          <p className="perf-v__kicker">Performance / Lectura NO.23</p>
          <h2 id="performance-title-a" className="perf-v__title">
            Cómo se comporta
          </h2>
        </header>

        <Reveal reduceMotion={reduceMotion}>
          <article className="perf-a__primary">
            <p className="perf-v__label">Longevidad</p>
            {model.hours ? <p className="perf-a__hours">{model.hours}</p> : null}
            <p className="perf-v__support">{model.longevityReading}</p>
            <PerformanceScale
              value={model.longevityPosition}
              marks={LONGEVITY_MARKS}
              ariaLabel={
                model.hours
                  ? `${model.longevityReading}. ${model.hours}`
                  : model.longevityReading
              }
              className="perf-scale--hairline"
            />
          </article>
        </Reveal>

        <div className="perf-a__pair">
          {model.projectionMarker ? (
            <Reveal reduceMotion={reduceMotion}>
              <article className="perf-a__secondary">
                <p className="perf-v__label">Proyección</p>
                <p className="perf-a__metric">{model.projectionMarker}</p>
                {model.projectionReading &&
                model.projectionReading !== model.projectionMarker ? (
                  <p className="perf-v__support">{model.projectionReading}</p>
                ) : null}
                <PerformanceScale
                  value={model.projectionPosition}
                  marks={PROJECTION_MARKS}
                  ariaLabel={model.projectionReading ?? model.projectionMarker}
                  className="perf-scale--hairline"
                />
              </article>
            </Reveal>
          ) : null}
          {model.sillageMarker ? (
            <Reveal reduceMotion={reduceMotion}>
              <article className="perf-a__secondary">
                <p className="perf-v__label">Sillage</p>
                <p className="perf-a__metric">{model.sillageMarker}</p>
                {model.sillageReading &&
                model.sillageReading !== model.sillageMarker ? (
                  <p className="perf-v__support">{model.sillageReading}</p>
                ) : null}
                <PerformanceScale
                  value={model.sillagePosition}
                  marks={SILLAGE_MARKS}
                  ariaLabel={model.sillageReading ?? model.sillageMarker}
                  className="perf-scale--hairline"
                />
              </article>
            </Reveal>
          ) : null}
        </div>

        <Reveal reduceMotion={reduceMotion}>
          <div className="perf-a__context">
            {model.seasons ? (
              <article className="perf-a__quiet">
                <p className="perf-v__label">Estación</p>
                <p className="perf-v__quiet-line">{model.seasons.reading}</p>
                <p className="perf-v__quiet-meta">
                  {model.seasons.spectrum
                    .filter((label, i) => spectrumWeight(model.seasons!, i, label) >= 0.7)
                    .join(" · ")}
                </p>
              </article>
            ) : null}
            {model.occasions ? (
              <article className="perf-a__quiet">
                <p className="perf-v__label">Ocasión</p>
                <p className="perf-v__quiet-line">{model.occasions.reading}</p>
                <p className="perf-v__quiet-meta">
                  {model.occasions.spectrum.join(" · ")}
                </p>
              </article>
            ) : null}
            {model.versatilityMarker ? (
              <article className="perf-a__quiet perf-a__quiet--end">
                <p className="perf-v__label">Versatilidad</p>
                <p className="perf-a__metric">{model.versatilityMarker}</p>
                {model.versatilityReading &&
                model.versatilityReading !== model.versatilityMarker ? (
                  <p className="perf-v__support">{model.versatilityReading}</p>
                ) : null}
              </article>
            ) : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Reveal({
  children,
  reduceMotion,
}: {
  children: ReactNode;
  reduceMotion: boolean;
}) {
  if (reduceMotion) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.35 }}
      transition={{ duration: 0.62, ease: easeOut }}
    >
      {children}
    </motion.div>
  );
}
