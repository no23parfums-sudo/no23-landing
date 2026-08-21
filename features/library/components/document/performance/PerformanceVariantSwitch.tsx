"use client";

import type { PerformancePresentation } from "../../../lib/presentation";
import type { PerformanceVariantId } from "../../../lib/performanceVariantModel";
import { SplitPerformanceSheet } from "./SplitPerformanceSheet";
import { SplitPerformanceA } from "./SplitPerformanceA";
import { SplitPerformanceB } from "./SplitPerformanceB";
import { PerformanceChapter } from "./PerformanceChapter";
import { SplitPerformanceC } from "./SplitPerformanceC";

type PerformanceVariantSwitchProps = {
  performance?: PerformancePresentation;
  smokeFilmSrc?: string;
  variant?: PerformanceVariantId | null;
};

/** Dev-only switch. Default split = compact editorial sheet. */
export function PerformanceVariantSwitch({
  performance,
  smokeFilmSrc,
  variant,
}: PerformanceVariantSwitchProps) {
  if (variant === "A") {
    return (
      <SplitPerformanceA performance={performance} smokeFilmSrc={smokeFilmSrc} />
    );
  }
  if (variant === "B") {
    return (
      <SplitPerformanceB performance={performance} smokeFilmSrc={smokeFilmSrc} />
    );
  }
  if (variant === "C1") {
    return (
      <PerformanceChapter
        performance={performance}
        smokeFilmSrc={smokeFilmSrc}
        mode="editorial"
      />
    );
  }
  if (variant === "C3") {
    return (
      <PerformanceChapter
        performance={performance}
        smokeFilmSrc={smokeFilmSrc}
        mode="narrative"
      />
    );
  }
  if (variant === "C") {
    return (
      <SplitPerformanceC performance={performance} smokeFilmSrc={smokeFilmSrc} />
    );
  }
  return <SplitPerformanceSheet performance={performance} />;
}
