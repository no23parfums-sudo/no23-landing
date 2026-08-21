"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import type { PerfumeDetail } from "../lib/types";
import {
  resolveOlfactiveArchitecture,
  resolvePerfumePresentation,
  resolveSignatureChapter,
} from "../lib/presentation";
import { PerfumeChapterRail } from "./PerfumeChapterRail";
import { PerfumeDocument } from "./document";
import { PerfumeHero } from "./hero";

type PerfumeDetailViewProps = {
  perfume: PerfumeDetail;
};

/**
 * Owns the active concentration/record slug for in-page family swaps.
 * Chapter 02 / 03 always resolve from the active slug — never inherited.
 */
export function PerfumeDetailView({ perfume }: PerfumeDetailViewProps) {
  const searchParams = useSearchParams();
  const motionMode =
    searchParams.get("motion") === "continuous" ? "continuous" : "current";
  const chapterLayout =
    searchParams.get("chapter") === "split" ? "split" : "current";
  const performanceParam = searchParams.get("performance");
  const performanceVariant =
    performanceParam === "A" ||
    performanceParam === "B" ||
    performanceParam === "C" ||
    performanceParam === "C1" ||
    performanceParam === "C3"
      ? performanceParam
      : null;
  const firmaParam = searchParams.get("firmaMotion");
  const firmaMotion =
    firmaParam === "timed" || firmaParam === "current" ? "timed" : "linked";
  const presentation = resolvePerfumePresentation(
    perfume.slug,
    perfume.displayName,
  );
  const [activeSlug, setActiveSlug] = useState(perfume.slug);
  const activeSignatureChapter = resolveSignatureChapter(activeSlug);
  const activeArchitecture = resolveOlfactiveArchitecture(activeSlug);

  const year = perfume.launchYear ?? presentation.yearFallback ?? null;

  return (
    <>
      <PerfumeChapterRail />
      <PerfumeHero
        presentation={presentation}
        concentration={perfume.commercialConcentrationLabel}
        year={year}
        commercialStatus={perfume.commercialStatusLabel}
        activeSlug={activeSlug}
        onActiveSlugChange={setActiveSlug}
        notesChapter={activeSignatureChapter.notesChapter ?? null}
        chapterLayout={chapterLayout}
      />
      <PerfumeDocument
        presentation={presentation}
        activeSignatureChapter={activeSignatureChapter}
        activeArchitecture={activeArchitecture}
        motionMode={motionMode}
        chapterLayout={chapterLayout}
        performanceVariant={performanceVariant}
        firmaMotion={firmaMotion}
      />
    </>
  );
}
