"use client";

import {
  motion,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useState } from "react";
import {
  LONGEVITY_MARKS,
  PROJECTION_MARKS,
  SILLAGE_MARKS,
  type PerformanceVariantModel,
} from "../../../lib/performanceVariantModel";
import { PerformanceContextBand } from "./PerformanceContextBand";
import { PerformanceHours } from "./PerformanceHours";
import { PerformanceIndexScale } from "./PerformanceIndexScale";

type PerformanceNarrativeProps = {
  model: PerformanceVariantModel;
  progress: MotionValue<number>;
  reduceMotion: boolean;
};

type Scene = 1 | 2 | 3;

/** C3 — three concise reading beats after the shared transition. */
export function PerformanceNarrative({
  model,
  progress,
  reduceMotion,
}: PerformanceNarrativeProps) {
  const [scene, setScene] = useState<Scene>(reduceMotion ? 3 : 1);
  const [drawn, setDrawn] = useState({
    longevity: reduceMotion,
    space: reduceMotion,
    context: reduceMotion,
  });

  useMotionValueEvent(progress, "change", (value) => {
    if (reduceMotion) return;
    setScene(value < 0.52 ? 1 : value < 0.68 ? 2 : 3);
    setDrawn((current) => {
      const next = {
        longevity: current.longevity || value >= 0.38,
        space: current.space || value >= 0.54,
        context: current.context || value >= 0.7,
      };
      if (
        next.longevity === current.longevity &&
        next.space === current.space &&
        next.context === current.context
      ) {
        return current;
      }
      return next;
    });
  });

  const longevityOp = useTransform(progress, [0.34, 0.44, 1], [0, 1, 1]);
  const longevityY = useTransform(progress, [0.34, 0.44, 1], [8, 0, 0]);
  const spaceOp = useTransform(progress, [0.52, 0.62, 1], [0, 1, 1]);
  const spaceY = useTransform(progress, [0.52, 0.62, 1], [8, 0, 0]);
  const contextOp = useTransform(progress, [0.68, 0.78, 1], [0, 1, 1]);
  const contextY = useTransform(progress, [0.68, 0.78, 1], [8, 0, 0]);

  return (
    <div className="perf-n" data-scene={scene}>
      <motion.div
        className="perf-n__scene perf-n__scene--longevity"
        style={reduceMotion ? undefined : { opacity: longevityOp, y: longevityY }}
      >
        <p className="perf-x__kicker">04 / Performance</p>
        <p className="perf-x__label">Longevidad</p>
        <PerformanceHours
          min={model.hoursMin}
          max={model.hoursMax}
          fallback={model.hoursCatalog}
          size={scene === 1 && !reduceMotion ? "display" : "quiet"}
        />
        <p className="perf-x__support">{model.longevityReading}</p>
        <PerformanceIndexScale
          value={model.longevityPosition}
          band={model.longevityBand}
          marks={LONGEVITY_MARKS}
          ariaLabel={model.longevityReading}
          drawn={drawn.longevity}
        />
      </motion.div>

      <motion.div
        className="perf-n__scene perf-n__scene--space"
        style={reduceMotion ? undefined : { opacity: spaceOp, y: spaceY }}
      >
        <div className="perf-e__pair">
          {model.projectionMarker ? (
            <article>
              <p className="perf-x__label">Proyección</p>
              <p className="perf-x__result">{model.projectionMarker}</p>
              {model.projectionReading &&
              model.projectionReading !== model.projectionMarker ? (
                <p className="perf-x__support">{model.projectionReading}</p>
              ) : null}
              <PerformanceIndexScale
                value={model.projectionPosition}
                marks={PROJECTION_MARKS}
                ariaLabel={model.projectionReading ?? model.projectionMarker}
                compact
                drawn={drawn.space}
              />
            </article>
          ) : null}
          {model.sillageMarker ? (
            <article>
              <p className="perf-x__label">Sillage</p>
              <p className="perf-x__result">{model.sillageMarker}</p>
              {model.sillageReading &&
              model.sillageReading !== model.sillageMarker ? (
                <p className="perf-x__support">{model.sillageReading}</p>
              ) : null}
              <PerformanceIndexScale
                value={model.sillagePosition}
                marks={SILLAGE_MARKS}
                ariaLabel={model.sillageReading ?? model.sillageMarker}
                compact
                drawn={drawn.space}
              />
            </article>
          ) : null}
        </div>
      </motion.div>

      <motion.div
        className="perf-n__scene perf-n__scene--context"
        style={reduceMotion ? undefined : { opacity: contextOp, y: contextY }}
      >
        <PerformanceContextBand
          model={model}
          drawn={drawn.context}
          emphasizeVersatility
        />
      </motion.div>
    </div>
  );
}
