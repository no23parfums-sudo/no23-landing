"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import type { PerformancePresentation } from "../../../lib/presentation";
import { buildPerformanceVariantModel } from "../../../lib/performanceVariantModel";
import { PerfVariantVisual } from "./PerfVariantVisual";

const easeOut = [0.22, 1, 0.36, 1] as const;

type SplitPerformanceBProps = {
  performance?: PerformancePresentation;
  smokeFilmSrc?: string;
};

/**
 * Temporary experiment B — performance canvas.
 * Magazine spread. Product stays; reading layers replace in place.
 */
export function SplitPerformanceB({
  performance,
  smokeFilmSrc,
}: SplitPerformanceBProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const trackRef = useRef<HTMLElement>(null);
  const [step, setStep] = useState(0);
  const model = performance ? buildPerformanceVariantModel(performance) : null;
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = value < 0.34 ? 0 : value < 0.67 ? 1 : 2;
    setStep((current) => (current === next ? current : next));
  });

  if (!model) return null;

  return (
    <section
      ref={trackRef}
      className="performance-section perf-v perf-b"
      aria-labelledby="performance-title-b"
      data-step={step}
    >
      <div className="perf-b__pin">
        <PerfVariantVisual
          src={smokeFilmSrc}
          className="perf-b__visual"
          reduceMotion={reduceMotion}
        />

        <div className="perf-b__compose">
          <header className="perf-b__head">
            <p className="perf-v__kicker">Performance / Lectura NO.23</p>
            <h2 id="performance-title-b" className="perf-v__title">
              Cómo se comporta
            </h2>
          </header>

          <Layer active={step === 0} reduceMotion={reduceMotion}>
            {model.hours ? <p className="perf-b__display">{model.hours}</p> : null}
            <p className="perf-v__label">Longevidad</p>
            <p className="perf-v__support">{model.longevityReading}</p>
          </Layer>

          <Layer active={step === 1} reduceMotion={reduceMotion}>
            <div className="perf-b__pair">
              {model.projectionMarker ? (
                <div>
                  <p className="perf-b__display perf-b__display--sm">
                    {model.projectionMarker}
                  </p>
                  <p className="perf-v__label">Proyección</p>
                  {model.projectionReading &&
                  model.projectionReading !== model.projectionMarker ? (
                    <p className="perf-v__support">{model.projectionReading}</p>
                  ) : null}
                </div>
              ) : null}
              {model.sillageMarker ? (
                <div>
                  <p className="perf-b__display perf-b__display--sm">
                    {model.sillageMarker}
                  </p>
                  <p className="perf-v__label">Sillage</p>
                  {model.sillageReading &&
                  model.sillageReading !== model.sillageMarker ? (
                    <p className="perf-v__support">{model.sillageReading}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Layer>

          <Layer active={step === 2} reduceMotion={reduceMotion}>
            <dl className="perf-b__index">
              {model.seasons ? (
                <div>
                  <dt>Estación</dt>
                  <dd>{model.seasons.reading}</dd>
                </div>
              ) : null}
              {model.occasions ? (
                <div>
                  <dt>Ocasión</dt>
                  <dd>{model.occasions.reading}</dd>
                </div>
              ) : null}
              {model.versatilityMarker ? (
                <div>
                  <dt>Versatilidad</dt>
                  <dd>{model.versatilityMarker}</dd>
                </div>
              ) : null}
            </dl>
          </Layer>
        </div>
      </div>
    </section>
  );
}

function Layer({
  active,
  reduceMotion,
  children,
}: {
  active: boolean;
  reduceMotion: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      className="perf-b__layer"
      aria-hidden={!active}
      initial={false}
      animate={
        reduceMotion
          ? { opacity: active ? 1 : 0 }
          : { opacity: active ? 1 : 0, y: active ? 0 : 10 }
      }
      transition={{ duration: 0.48, ease: easeOut }}
      style={{ pointerEvents: active ? "auto" : "none" }}
    >
      {children}
    </motion.div>
  );
}
