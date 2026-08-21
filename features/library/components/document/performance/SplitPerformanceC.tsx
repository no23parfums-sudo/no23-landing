"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, useState, type ReactNode } from "react";
import type { PerformancePresentation } from "../../../lib/presentation";
import {
  LONGEVITY_MARKS,
  PROJECTION_MARKS,
  SILLAGE_MARKS,
  buildPerformanceVariantModel,
} from "../../../lib/performanceVariantModel";
import { PerformanceContextBand } from "./PerformanceContextBand";
import { PerformanceIndexScale } from "./PerformanceIndexScale";
import { PerfVariantVisual } from "./PerfVariantVisual";

type SplitPerformanceCProps = {
  performance?: PerformancePresentation;
  smokeFilmSrc?: string;
};

type DrawnState = {
  longevity: boolean;
  projection: boolean;
  sillage: boolean;
  context: boolean;
};

const DRAWN_ALL: DrawnState = {
  longevity: true,
  projection: true,
  sillage: true,
  context: true,
};

/**
 * Variant C — cinematic Section 3→4 bridge into the NO.23 Performance Index.
 * One video instance interpolates from editorial field to the left index panel.
 */
export function SplitPerformanceC({
  performance,
  smokeFilmSrc,
}: SplitPerformanceCProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const sectionRef = useRef<HTMLElement>(null);
  const model = performance ? buildPerformanceVariantModel(performance) : null;
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const [drawn, setDrawn] = useState<DrawnState>(
    reduceMotion ? DRAWN_ALL : {
      longevity: false,
      projection: false,
      sillage: false,
      context: false,
    },
  );
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (reduceMotion) return;
    setDrawn((current) => {
      const next: DrawnState = {
        longevity: current.longevity || value >= 0.34,
        projection: current.projection || value >= 0.42,
        sillage: current.sillage || value >= 0.5,
        context: current.context || value >= 0.58,
      };
      if (
        next.longevity === current.longevity &&
        next.projection === current.projection &&
        next.sillage === current.sillage &&
        next.context === current.context
      ) {
        return current;
      }
      return next;
    });
  });

  const visualPct = useTransform(scrollYProgress, [0.1, 0.36, 1], [100, 34, 34]);
  const visualWidth = useTransform(() => `${visualPct.get()}%`);
  const chapterOpacity = useTransform(
    scrollYProgress,
    [0.04, 0.12, 0.24, 0.36],
    [0, 1, 1, 0],
  );
  const indexOpacity = useTransform(scrollYProgress, [0.3, 0.4, 1], [0, 1, 1]);
  const longevityOpacity = useTransform(scrollYProgress, [0.32, 0.42, 1], [0, 1, 1]);
  const longevityY = useTransform(scrollYProgress, [0.32, 0.42, 1], [8, 0, 0]);
  const projectionOpacity = useTransform(scrollYProgress, [0.4, 0.5, 1], [0, 1, 1]);
  const projectionY = useTransform(scrollYProgress, [0.4, 0.5, 1], [8, 0, 0]);
  const sillageOpacity = useTransform(scrollYProgress, [0.48, 0.58, 1], [0, 1, 1]);
  const sillageY = useTransform(scrollYProgress, [0.48, 0.58, 1], [8, 0, 0]);
  const contextOpacity = useTransform(scrollYProgress, [0.56, 0.66, 1], [0, 1, 1]);
  const contextY = useTransform(scrollYProgress, [0.56, 0.66, 1], [8, 0, 0]);

  if (!model) return null;

  return (
    <section
      ref={sectionRef}
      className="performance-section perf-v perf-c"
      aria-labelledby="performance-title-c"
      data-settled={drawn.longevity ? "true" : "false"}
    >
      <h2 id="performance-title-c" className="sr-only">
        Cómo se comporta
      </h2>

      <div className="perf-c__pin">
        <div className="perf-c__layout">
          <motion.div
            className="perf-c__frame"
            style={reduceMotion ? undefined : { width: visualWidth }}
          >
            <PerfVariantVisual
              src={smokeFilmSrc}
              className="perf-c__visual"
              reduceMotion={reduceMotion}
              fit="cover"
            />
            <motion.p
              className="perf-c__chapter"
              style={reduceMotion ? undefined : { opacity: chapterOpacity }}
              aria-hidden="true"
            >
              <span className="perf-c__chapter-id">04 / Performance</span>
              <span className="perf-c__chapter-title">Cómo se comporta</span>
            </motion.p>
          </motion.div>

          <motion.div
            className="perf-c__index"
            style={reduceMotion ? undefined : { opacity: indexOpacity }}
          >
            <p className="perf-c__index-kicker">NO.23 Performance Index</p>

            <IndexReveal
              reduceMotion={reduceMotion}
              opacity={longevityOpacity}
              y={longevityY}
            >
              <article className="perf-c__hero" data-active={drawn.longevity}>
                <p className="perf-c__ref">
                  PERF. 01<span aria-hidden="true"> / </span>Longevidad
                </p>
                {model.hoursMin !== null && model.hoursMax !== null ? (
                  <p className="perf-c__hours">
                    <span className="perf-c__hours-range">
                      {model.hoursMin}
                      <span aria-hidden="true">—</span>
                      {model.hoursMax}
                    </span>
                    <span className="perf-c__hours-unit">H</span>
                  </p>
                ) : model.hoursCatalog ? (
                  <p className="perf-c__hours">
                    <span className="perf-c__hours-range">
                      {model.hoursCatalog}
                    </span>
                  </p>
                ) : null}
                <p className="perf-c__support">{model.longevityReading}</p>
                <PerformanceIndexScale
                  value={model.longevityPosition}
                  band={model.longevityBand}
                  marks={LONGEVITY_MARKS}
                  ariaLabel={model.longevityReading}
                  drawn={drawn.longevity}
                />
              </article>
            </IndexReveal>

            <div className="perf-c__pair">
              {model.projectionMarker ? (
                <IndexReveal
                  reduceMotion={reduceMotion}
                  opacity={projectionOpacity}
                  y={projectionY}
                >
                  <article data-active={drawn.projection}>
                    <p className="perf-c__ref">
                      PERF. 02<span aria-hidden="true"> / </span>Proyección
                    </p>
                    <p className="perf-c__result">{model.projectionMarker}</p>
                    {model.projectionReading &&
                    model.projectionReading !== model.projectionMarker ? (
                      <p className="perf-c__support">{model.projectionReading}</p>
                    ) : null}
                    <PerformanceIndexScale
                      value={model.projectionPosition}
                      marks={PROJECTION_MARKS}
                      ariaLabel={
                        model.projectionReading ?? model.projectionMarker
                      }
                      compact
                      drawn={drawn.projection}
                    />
                  </article>
                </IndexReveal>
              ) : null}

              {model.sillageMarker ? (
                <IndexReveal
                  reduceMotion={reduceMotion}
                  opacity={sillageOpacity}
                  y={sillageY}
                >
                  <article data-active={drawn.sillage}>
                    <p className="perf-c__ref">
                      PERF. 03<span aria-hidden="true"> / </span>Sillage
                    </p>
                    <p className="perf-c__result">{model.sillageMarker}</p>
                    {model.sillageReading &&
                    model.sillageReading !== model.sillageMarker ? (
                      <p className="perf-c__support">{model.sillageReading}</p>
                    ) : null}
                    <PerformanceIndexScale
                      value={model.sillagePosition}
                      marks={SILLAGE_MARKS}
                      ariaLabel={model.sillageReading ?? model.sillageMarker}
                      compact
                      drawn={drawn.sillage}
                    />
                  </article>
                </IndexReveal>
              ) : null}
            </div>

            <IndexReveal
              reduceMotion={reduceMotion}
              opacity={contextOpacity}
              y={contextY}
            >
              <PerformanceContextBand model={model} drawn={drawn.context} />
            </IndexReveal>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function IndexReveal({
  children,
  reduceMotion,
  opacity,
  y,
}: {
  children: ReactNode;
  reduceMotion: boolean;
  opacity: MotionValue<number>;
  y: MotionValue<number>;
}) {
  if (reduceMotion) return <>{children}</>;
  return <motion.div style={{ opacity, y }}>{children}</motion.div>;
}
