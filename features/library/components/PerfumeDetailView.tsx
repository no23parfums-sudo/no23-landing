"use client";

import { useState } from "react";
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
      />
      <PerfumeDocument
        presentation={presentation}
        activeSignatureChapter={activeSignatureChapter}
        activeArchitecture={activeArchitecture}
      />
    </>
  );
}
