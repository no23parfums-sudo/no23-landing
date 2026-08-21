"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type {
  ArchitecturePresentation,
  NotesChapterPresentation,
  SignatureNote,
} from "../../lib/presentation";
import { OlfactiveIdentity } from "./OlfactiveIdentity";
import { OlfactoryArchitecture, type AtlasPhaseId } from "./OlfactoryArchitecture";
import { splitStateFromPhase } from "./splitAnnotationMap";

type SignatureArchitectureChapterProps = {
  signatureNotes?: SignatureNote[];
  notesChapter?: NotesChapterPresentation;
  architecture?: ArchitecturePresentation | null;
  architectureSignatures?: SignatureNote[];
  motionMode?: "current" | "continuous";
};

const PHASE_FROM_NOTE: Record<string, AtlasPhaseId> = {
  top: "top",
  heart: "heart",
  base: "base",
  composition: "composition",
};

function subscribeDesktop(onChange: () => void) {
  const mq = window.matchMedia("(min-width: 1024px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function desktopSnapshot() {
  return window.matchMedia("(min-width: 1024px)").matches;
}

/** Desktop-first: prototype QA is 1440. Mobile hydrates to sequential. */
function desktopServerSnapshot() {
  return true;
}

/**
 * Prototype combined Signature Notes × Architecture chapter.
 * Desktop ≥1024: CSS grid + sticky atlas. Below: current sequential flow.
 */
export function SignatureArchitectureChapter({
  signatureNotes,
  notesChapter,
  architecture,
  architectureSignatures,
  motionMode = "current",
}: SignatureArchitectureChapterProps) {
  const desktop = useSyncExternalStore(
    subscribeDesktop,
    desktopSnapshot,
    desktopServerSnapshot,
  );
  const rootRef = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<AtlasPhaseId>("top");
  const phaseRef = useRef<AtlasPhaseId>("top");

  useEffect(() => {
    const root = rootRef.current;
    if (!root || !desktop) return;

    const header = document.querySelector<HTMLElement>(".library-header");
    const applyTop = () => {
      const h = header?.getBoundingClientRect().height ?? 84;
      const px = `${Math.round(h)}px`;
      root.style.setProperty("--split-header-h", px);
      root
        .closest<HTMLElement>(".perfume-document")
        ?.style.setProperty("--split-header-h", px);
    };
    applyTop();
    window.addEventListener("resize", applyTop);

    const atlas = () =>
      root.querySelector<HTMLElement>(".signature-architecture-chapter__atlas");

    const commitPhase = (next: AtlasPhaseId) => {
      if (phaseRef.current === next) return;
      phaseRef.current = next;
      setPhase(next);
    };

    const updatePhase = () => {
      const stage = atlas()?.getBoundingClientRect();
      const headerH = header?.getBoundingClientRect().height ?? 84;
      const stickyTop = headerH;
      const released = Boolean(stage && stage.top < stickyTop - 16);

      if (released) {
        commitPhase("composition");
        return;
      }

      if (phaseRef.current === "composition" && stage && stage.top < stickyTop - 4) {
        return;
      }

      const stories: { id: string; dist: number }[] = [];
      root.querySelectorAll<HTMLElement>("[data-split-note]").forEach((node) => {
        const id = node.dataset.splitNote;
        if (!id) return;
        const media =
          node.querySelector<HTMLElement>(".note-specimen__media") ?? node;
        stories.push({
          id,
          dist: Math.abs(media.getBoundingClientRect().top - stickyTop),
        });
      });
      if (!stories.length) return;

      stories.sort((a, b) => a.dist - b.dist);
      const best = stories[0];
      const next = PHASE_FROM_NOTE[best.id];
      if (!next) return;

      const current = stories.find(
        (story) => PHASE_FROM_NOTE[story.id] === phaseRef.current,
      );
      if (!current || phaseRef.current === "composition") {
        commitPhase(next);
        return;
      }
      if (next === phaseRef.current) return;
      if (best.dist + 32 < current.dist) commitPhase(next);
    };

    const observer = new IntersectionObserver(() => {
      updatePhase();
    }, {
      root: null,
      rootMargin: "-40% 0px -20% 0px",
      threshold: [0, 0.2, 0.45, 0.75, 1],
    });

    root.querySelectorAll<HTMLElement>("[data-split-note]").forEach((node) => {
      observer.observe(node);
    });
    window.addEventListener("scroll", updatePhase, { passive: true });
    updatePhase();

    return () => {
      window.removeEventListener("resize", applyTop);
      window.removeEventListener("scroll", updatePhase);
      observer.disconnect();
    };
  }, [desktop]);

  if (!desktop) {
    return (
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
    );
  }

  const railChapter = phase === "composition" ? "04" : "03";

  return (
    <section
      ref={rootRef}
      className="signature-architecture-chapter"
      data-split-phase={phase}
      data-split-state={splitStateFromPhase(phase)}
      data-active-story={
        phase === "top" ? 0 : phase === "heart" ? 1 : phase === "base" ? 2 : 3
      }
      data-rail-chapter={railChapter}
      aria-label="Notas signatura y arquitectura olfativa"
    >
      <div className="signature-architecture-chapter__notes">
        <OlfactiveIdentity
          signatureNotes={signatureNotes}
          chapter={notesChapter}
          layout="split"
          activeStory={
            phase === "top" || phase === "heart" || phase === "base"
              ? phase
              : null
          }
        />
      </div>
      <div className="signature-architecture-chapter__atlas">
        <OlfactoryArchitecture
          architecture={architecture ?? null}
          signatureNotes={architectureSignatures}
          motionMode={motionMode}
          layout="split"
          drivenPhase={phase}
          onDrivenPhaseChange={setPhase}
        />
      </div>
    </section>
  );
}
