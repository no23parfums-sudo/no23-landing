import type {
  ArchitecturePresentation,
  NotesChapterPresentation,
  PerfumePresentation,
  SignatureNote,
} from "../../lib/presentation";
import { relatedEntitiesFrom, resolveRelations } from "../../lib/presentation";
import { AffinitiesSection } from "./AffinitiesSection";
import { ExploreBibliothequeBanner } from "./PerfumeExploreClose";
import { ReviewsSection } from "./ReviewsSection";
import { Moodboard } from "./Moodboard";
import {
  ArchitectureCinematicHandoff,
  /** Legacy Architecture→Smoke bridge — preserved for A/B; off while Smoke opens Performance. */
  LEGACY_ARCH_SMOKE_BRIDGE,
} from "./ArchitectureCinematicHandoff";
import { OlfactiveIdentity } from "./OlfactiveIdentity";
import { OlfactoryArchitecture } from "./OlfactoryArchitecture";
import { PerformanceSection } from "./PerformanceSection";
import { SignatureArchitectureChapter } from "./SignatureArchitectureChapter";
import { SplitEditorialIntro } from "./SplitEditorialIntro";
import { SplitChapterCue } from "./SplitChapterCue";
import { PerfumeRelationsSection } from "./PerfumeRelationsSection";

type PerfumeDocumentProps = {
  presentation: PerfumePresentation;
  /**
   * Chapter 02 for the ACTIVE concentration/record.
   * When omitted, falls back to presentation — prefer passing
   * resolveSignatureChapter(activeSlug) so content never leaks across slugs.
   */
  activeSignatureChapter?: {
    notesChapter?: NotesChapterPresentation;
    signatureNotes?: SignatureNote[];
  };
  /**
   * Chapter 03 for the ACTIVE concentration/record.
   * When provided, never fall back to presentation.architecture —
   * missing stillLifeSrc means the section does not render.
   */
  activeArchitecture?: {
    architecture?: ArchitecturePresentation;
    signatureNotes?: SignatureNote[];
  };
  /** Prototype A flag — default current V1.1. */
  motionMode?: "current" | "continuous";
  /** Prototype split S2/S3 chapter — default current sequential. */
  chapterLayout?: "current" | "split";
  /** Temporary Section 4 experiments. Omit = current production split. */
  performanceVariant?: "A" | "B" | "C" | "C1" | "C3" | null;
  /** Split Firma motion. Default = approved scroll-linked assembly. */
  firmaMotion?: "linked" | "timed";
};

/**
 * Master fragrance document — permanent NO.23 chapter order.
 * Content changes per fragrance; structure does not.
 */
export function PerfumeDocument({
  presentation,
  activeSignatureChapter,
  activeArchitecture,
  motionMode = "current",
  chapterLayout = "current",
  performanceVariant = null,
  firmaMotion = "linked",
}: PerfumeDocumentProps) {
  /* When activeSignatureChapter is provided, never fall back to page record */
  const notesChapter = activeSignatureChapter
    ? activeSignatureChapter.notesChapter
    : presentation.notesChapter;
  const signatureNotes = activeSignatureChapter
    ? activeSignatureChapter.signatureNotes
    : presentation.signatureNotes;

  const architecture = activeArchitecture
    ? activeArchitecture.architecture
    : presentation.architecture;
  const architectureSignatures = activeArchitecture
    ? activeArchitecture.signatureNotes
    : signatureNotes;

  const smokeFilmSrc = architecture?.cinematic?.smokeFilmSrc;
  const bridgeTime = architecture?.cinematic?.bridgeTime ?? 7.5;

  const currentVariant = presentation.variants?.find((v) => v.current);
  const concentration =
    currentVariant?.concentration ??
    presentation.variants?.find((v) => v.href)?.concentration;

  const relations = resolveRelations(presentation);

  return (
    <div
      className="perfume-document"
      data-motion={motionMode}
      data-chapter-layout={chapterLayout}
    >
      <div className="perfume-document__sheet">
        {chapterLayout === "split" ? (
          <>
            <SplitEditorialIntro
              notesChapter={notesChapter}
              firmaMotion={firmaMotion}
            />
            <SplitChapterCue architecture={architecture ?? null} />
            <SignatureArchitectureChapter
              signatureNotes={signatureNotes}
              notesChapter={notesChapter}
              architecture={architecture ?? null}
              architectureSignatures={architectureSignatures}
              motionMode={motionMode}
            />
          </>
        ) : (
          <>
            <OlfactiveIdentity
              signatureNotes={signatureNotes}
              chapter={notesChapter}
            />
            <div className="perfume-document__page-seam" aria-hidden="true" />
            <OlfactoryArchitecture
              architecture={architecture ?? null}
              signatureNotes={architectureSignatures}
              motionMode={motionMode}
            />
          </>
        )}
        {LEGACY_ARCH_SMOKE_BRIDGE && smokeFilmSrc ? (
          <ArchitectureCinematicHandoff
            smokeFilmSrc={smokeFilmSrc}
            bridgeTime={bridgeTime}
          />
        ) : null}
        {/* Moodboard / Inspiración — only when presentation provides it */}
        <Moodboard moodboard={presentation.moodboard} />
        <PerformanceSection
          performance={presentation.performance}
          smokeFilmSrc={smokeFilmSrc}
          layout={chapterLayout}
          variant={performanceVariant}
        />
        <PerfumeRelationsSection
          relations={relations}
          guidance={presentation.performance?.criterio}
          perfumeName={presentation.heroName}
          concentration={concentration}
          commerce={presentation.commerce}
          relatedEntities={relatedEntitiesFrom(presentation)}
          layout={chapterLayout}
        />
        <AffinitiesSection affinities={presentation.affinities} />
        <ReviewsSection reviews={presentation.reviews} />
        <ExploreBibliothequeBanner />
      </div>
    </div>
  );
}
