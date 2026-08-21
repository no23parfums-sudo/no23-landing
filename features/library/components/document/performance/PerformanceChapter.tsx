"use client";

import { useReducedMotion } from "motion/react";
import type { PerformancePresentation } from "../../../lib/presentation";
import { buildPerformanceVariantModel } from "../../../lib/performanceVariantModel";
import { PerformanceChapterPlate } from "./PerformanceChapterPlate";
import { PerformanceEditorial } from "./PerformanceEditorial";
import { PerformanceNarrative } from "./PerformanceNarrative";
import { PerformanceTransition } from "./PerformanceTransition";

type PerformanceChapterProps = {
  performance?: PerformancePresentation;
  smokeFilmSrc?: string;
  mode: "editorial" | "narrative";
};

export function PerformanceChapter({
  performance,
  smokeFilmSrc,
  mode,
}: PerformanceChapterProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const model = performance ? buildPerformanceVariantModel(performance) : null;
  if (!model) return null;

  if (mode === "editorial") {
    return (
      <section
        className="performance-section perf-v perf-x perf-x--editorial"
        aria-labelledby="performance-title-x"
      >
        <PerformanceChapterPlate model={model} reduceMotion={reduceMotion} />
        <PerformanceEditorial model={model} reduceMotion={reduceMotion} />
      </section>
    );
  }

  return (
    <PerformanceTransition
      smokeFilmSrc={smokeFilmSrc}
      mode={mode}
      reduceMotion={reduceMotion}
    >
      {({ progress }) => (
        <PerformanceNarrative
          model={model}
          progress={progress}
          reduceMotion={reduceMotion}
        />
      )}
    </PerformanceTransition>
  );
}
