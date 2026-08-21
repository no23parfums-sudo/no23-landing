"use client";

import { motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import {
  splitEditorialReading,
  spectrumWeight,
} from "../../../lib/performanceVariantModel";
import type { PerformanceVariantModel } from "../../../lib/performanceVariantModel";
import { PerformanceHours } from "./PerformanceHours";
import {
  LongevityInstrument,
  OccasionNodes,
  ProjectionArcs,
  SeasonGlyphs,
  SillageTrail,
  VersatilitySpectrum,
} from "./PerformanceMarks";

type PerformanceEditorialProps = {
  model: PerformanceVariantModel;
  reduceMotion: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;

/** C1 — full-width NO.23 Performance Index. No video. */
export function PerformanceEditorial({
  model,
  reduceMotion,
}: PerformanceEditorialProps) {
  const reduced = reduceMotion || Boolean(useReducedMotion());
  const seasonCopy = model.seasons
    ? splitEditorialReading(model.seasons.reading)
    : null;
  const peakOccasion = model.occasions
    ? peakIndex(model.occasions)
    : -1;

  return (
    <div className="perf-e">
      <Drawn reduced={reduced} className="perf-e__sensorial">
        {(drawn) => (
          <>
            <article className="perf-e__hero">
              <p className="perf-x__label">Longevidad</p>
              <PerformanceHours
                min={model.hoursMin}
                max={model.hoursMax}
                fallback={model.hoursCatalog}
              />
              <p className="perf-x__support">{model.longevityReading}</p>
              <LongevityInstrument
                hoursMin={model.hoursMin}
                hoursMax={model.hoursMax}
                ariaLabel={model.longevityReading}
                drawn={drawn}
              />
            </article>

            {model.projectionMarker ? (
              <article className="perf-e__proj perf-e__spatial">
                <header className="perf-e__copy">
                  <p className="perf-x__label">Proyección</p>
                  <p className="perf-x__result">
                    {toTitle(model.projectionMarker)}
                  </p>
                  {model.projectionReading &&
                  model.projectionReading !== model.projectionMarker ? (
                    <p className="perf-x__support">{model.projectionReading}</p>
                  ) : null}
                </header>
                <ProjectionArcs level={model.projectionLevel} drawn={drawn} />
              </article>
            ) : null}

            {model.sillageMarker ? (
              <article className="perf-e__sil perf-e__spatial">
                <header className="perf-e__copy">
                  <p className="perf-x__label">Sillage</p>
                  <p className="perf-x__result">
                    {toTitle(model.sillageMarker)}
                  </p>
                  {model.sillageReading &&
                  model.sillageReading !== model.sillageMarker ? (
                    <p className="perf-x__support">{model.sillageReading}</p>
                  ) : null}
                </header>
                <SillageTrail level={model.sillageLevel} drawn={drawn} />
              </article>
            ) : null}
          </>
        )}
      </Drawn>

      <Drawn reduced={reduced} delay={0.08} className="perf-e__context">
        {(drawn) => (
          <>
            {model.seasons && seasonCopy ? (
              <article className="perf-e__cell">
                <p className="perf-x__label">Estación</p>
                <p className="perf-x__cell-lead">{seasonCopy.primary}</p>
                {seasonCopy.secondary ? (
                  <p className="perf-x__cell-note">{seasonCopy.secondary}</p>
                ) : null}
                <SeasonGlyphs reading={model.seasons} drawn={drawn} />
              </article>
            ) : null}
            {model.occasions ? (
              <article className="perf-e__cell">
                <p className="perf-x__label">Ocasión</p>
                <p className="perf-x__cell-lead">{model.occasions.reading}</p>
                <OccasionNodes
                  reading={model.occasions}
                  drawn={drawn}
                  peakIndex={peakOccasion}
                />
              </article>
            ) : null}
            {model.versatilityMarker ? (
              <article className="perf-e__cell">
                <p className="perf-x__label">Versatilidad</p>
                <p className="perf-x__result">
                  {toTitle(model.versatilityMarker)}
                </p>
                <VersatilitySpectrum
                  value={model.versatilityPosition}
                  poles={model.versatilityPoles}
                  ariaLabel={
                    model.versatilityReading ?? model.versatilityMarker
                  }
                  drawn={drawn}
                />
              </article>
            ) : null}
          </>
        )}
      </Drawn>
    </div>
  );
}

function toTitle(value: string) {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function peakIndex(reading: {
  spectrum: string[];
  weights?: number[];
  active: string[];
}) {
  let best = 0;
  let bestW = -1;
  let second = -1;
  reading.spectrum.forEach((label, i) => {
    const w = spectrumWeight(reading, i, label);
    if (w > bestW) {
      second = bestW;
      bestW = w;
      best = i;
    } else if (w > second) {
      second = w;
    }
  });
  if (bestW < 0.75) return -1;
  return best;
}

function Drawn({
  children,
  reduced,
  delay = 0,
  className,
}: {
  children: (drawn: boolean) => ReactNode;
  reduced: boolean;
  delay?: number;
  className?: string;
}) {
  const [drawn, setDrawn] = useState(reduced);
  return (
    <motion.div
      className={className}
      initial={reduced ? false : { opacity: 0, y: 6 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ duration: 0.5, delay, ease }}
      onViewportEnter={() => setDrawn(true)}
    >
      {children(drawn)}
    </motion.div>
  );
}
