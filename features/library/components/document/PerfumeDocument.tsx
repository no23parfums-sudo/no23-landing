import type {
  ArchitecturePresentation,
  NotesChapterPresentation,
  PerfumePresentation,
  SignatureNote,
} from "../../lib/presentation";
import { AffinitiesSection } from "./AffinitiesSection";
import { LineageSection } from "./LineageSection";
import { Moodboard } from "./Moodboard";
import {
  ArchitectureCinematicHandoff,
  /** Legacy Architecture→Smoke bridge — preserved for A/B; off while Smoke opens Performance. */
  LEGACY_ARCH_SMOKE_BRIDGE,
} from "./ArchitectureCinematicHandoff";
import { OlfactiveIdentity } from "./OlfactiveIdentity";
import { OlfactoryArchitecture } from "./OlfactoryArchitecture";
import { PerformanceSection } from "./PerformanceSection";
import { PerfumeActions } from "./PerfumeActions";

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
};

/**
 * Master fragrance document — permanent NO.23 chapter order.
 * Content changes per fragrance; structure does not.
 */
export function PerfumeDocument({
  presentation,
  activeSignatureChapter,
  activeArchitecture,
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

  return (
    <div className="perfume-document">
      <div className="perfume-document__sheet">
        <OlfactiveIdentity
          signatureNotes={signatureNotes}
          chapter={notesChapter}
        />
        <OlfactoryArchitecture
          architecture={architecture ?? null}
          signatureNotes={architectureSignatures}
        />
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
        />
        <LineageSection lineage={presentation.lineage} />
        <AffinitiesSection affinities={presentation.affinities} />
        <PerfumeActions
          perfumeName={presentation.heroName}
          concentration={concentration}
          commerce={presentation.commerce}
        />
      </div>
    </div>
  );
}
