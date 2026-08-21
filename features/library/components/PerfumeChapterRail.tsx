"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_HERO_CHAPTERS,
  HeroChapterIndex,
  type HeroChapter,
} from "./hero/HeroChapterIndex";

type Surface = "dark" | "cream";

/**
 * Persistent left chapter rail for the full perfume page.
 * Visual treatment matches the Hero index; active id tracks dominant section:
 * 01 Hero · 02 Firma · 03 Signature Notes · 04 Arquitectura
 * 05 Performance → La Línea / Criterio (final chapter)
 *
 * When Architecture exposes left-side annotations, the rail softly conceals
 * (still chapter 04 in page state) so labels can use that space.
 */
export function PerfumeChapterRail() {
  const [current, setCurrent] = useState("01");
  const [surface, setSurface] = useState<Surface>("dark");
  const [concealed, setConcealed] = useState(false);
  const [chapters, setChapters] = useState<readonly HeroChapter[]>(
    DEFAULT_HERO_CHAPTERS,
  );

  useEffect(() => {
    const shell = document.querySelector<HTMLElement>("[data-perfume-shell]");
    const notesPlate = () =>
      document.querySelector<HTMLElement>(".fragrance-notes__triptych") ??
      document.querySelector<HTMLElement>(".fragrance-notes");
    const archPlate = () =>
      document.querySelector<HTMLElement>(".arch-atlas__canvas") ??
      document.querySelector<HTMLElement>(".arch-atlas__viewport");
    const archSection = () =>
      document.querySelector<HTMLElement>(".olfactory-architecture--atlas");
    const performanceSection = () =>
      document.querySelector<HTMLElement>(".performance-section");
    /** La Línea / Criterio — final document chapter (rail 05). */
    const relationsSection = () =>
      document.querySelector<HTMLElement>(
        ".perfume-relations, .lineage-section",
      );

    let frame = 0;
    /** Last valid document chapter once past early firma/notes — never invent 07. */
    let lastDocumentChapter: { id: string; surface: Surface } | null = null;

    const visibleRatio = (rect: DOMRect | undefined, vh: number) => {
      if (!rect || rect.height <= 0) return 0;
      const top = Math.max(rect.top, 0);
      const bottom = Math.min(rect.bottom, vh);
      const visible = Math.max(0, bottom - top);
      return visible / Math.min(rect.height, vh);
    };

    const midDistance = (rect: DOMRect | undefined, vh: number) => {
      if (!rect) return Number.POSITIVE_INFINITY;
      const mid = (rect.top + rect.bottom) / 2;
      return Math.abs(mid - vh * 0.45);
    };

    const setChapter = (id: string, nextSurface: Surface) => {
      setCurrent((c) => (c === id ? c : id));
      setSurface((s) => (s === nextSurface ? s : nextSurface));
      if (shell) shell.dataset.pageChapter = id;
    };

    const syncChapterList = () => {
      const next = DEFAULT_HERO_CHAPTERS;
      setChapters((prev) => {
        if (
          prev.length === next.length &&
          prev.every((c, i) => c.id === next[i]?.id)
        ) {
          return prev;
        }
        return next;
      });
    };

    const resolve = () => {
      const vh = window.innerHeight;
      const heroPhase = shell?.dataset.heroPhase ?? "hero";
      const heroChapter = shell?.dataset.heroChapter ?? "idle";
      const arch = archSection();
      syncChapterList();
      const wantConceal =
        arch?.getAttribute("data-rail-conceal") === "true" &&
        visibleRatio(archPlate()?.getBoundingClientRect(), vh) > 0.15;
      setConcealed((c) => (c === wantConceal ? c : wantConceal));

      /* Hero pin — identity / firma only */
      if (heroPhase === "hero" || heroPhase === "retreat") {
        setChapter("01", "dark");
        return;
      }

      if (
        heroPhase === "chapter" ||
        heroChapter === "settling" ||
        (heroChapter === "active" && heroPhase !== "document")
      ) {
        setChapter("02", "dark");
        return;
      }

      /* Split prototype — one chapter, rail 03 during notes / 04 on composition tail */
      const splitChapter = document.querySelector<HTMLElement>(
        ".signature-architecture-chapter",
      );
      if (splitChapter) {
        const splitVis = visibleRatio(
          splitChapter.getBoundingClientRect(),
          vh,
        );
        const perfPreview = performanceSection();
        const perfPreviewPlate =
          perfPreview?.querySelector<HTMLElement>(
            ".performance-section__stage",
          ) ?? perfPreview;
        const perfPreviewRect = perfPreviewPlate?.getBoundingClientRect();
        const perfPreviewVis = visibleRatio(perfPreviewRect, vh);
        const perfEntering =
          perfPreviewVis > 0.18 &&
          (perfPreviewRect?.top ?? Number.POSITIVE_INFINITY) < vh * 0.42;
        if (splitVis > 0.12 && !perfEntering) {
          const id =
            splitChapter.dataset.railChapter === "04" ? "04" : "03";
          setChapter(id, "cream");
          lastDocumentChapter = { id, surface: "cream" };
          return;
        }
      }

      /* Document plane — choose Notes vs Architecture by plate dominance */
      const notesRect = notesPlate()?.getBoundingClientRect();
      const archRect = archPlate()?.getBoundingClientRect();
      const notesVis = visibleRatio(notesRect, vh);
      const archVis = visibleRatio(archRect, vh);
      const notesDist = midDistance(notesRect, vh);
      const archDist = midDistance(archRect, vh);

      const notesReadable = notesVis > 0.18;
      const archReadable = archVis > 0.2;

      /*
       * Prefer Signature Notes while its triptych owns the reading band.
       * Architecture wins only when its canvas is clearly closer / more visible.
       */
      if (
        notesReadable &&
        (!archReadable || notesDist + 40 < archDist || notesVis >= archVis)
      ) {
        setChapter("03", "cream");
        lastDocumentChapter = { id: "03", surface: "cream" };
        return;
      }

      if (archReadable) {
        setChapter("04", "dark");
        lastDocumentChapter = { id: "04", surface: "dark" };
        return;
      }

      const perfSection = performanceSection();
      /*
       * Ownership uses the sticky Overview stage — not the tall transparent
       * runway box. After release, La Línea / Criterio remain chapter 05.
       */
      const perfPlate =
        perfSection?.querySelector<HTMLElement>(
          ".performance-section__stage",
        ) ?? perfSection;
      const perfRect = perfPlate?.getBoundingClientRect();
      const relationsRect = relationsSection()?.getBoundingClientRect();
      const perfVis = visibleRatio(perfRect, vh);
      const relationsVis = visibleRatio(relationsRect, vh);
      const perfDist = midDistance(perfRect, vh);
      const relationsDist = midDistance(relationsRect, vh);
      const release =
        parseFloat(perfSection?.style.getPropertyValue("--perf-release") ?? "") ||
        0;

      const criterioRect = document
        .querySelector<HTMLElement>(".no23-guidance")
        ?.getBoundingClientRect();
      const footerRect = document
        .querySelector<HTMLElement>(
          ".perfume-explore-close, .library-footer, footer",
        )
        ?.getBoundingClientRect();
      const criterioVis = visibleRatio(criterioRect, vh);
      const footerVis = visibleRatio(footerRect, vh);
      const hasRelations = Boolean(relationsSection());

      /*
       * After Performance has released: Criterio / Footer keep 05.
       * Evaluate before sticky-stage ghost visibility can steal ownership.
       */
      if (
        release >= 0.95 &&
        (criterioVis > 0.18 || footerVis > 0.12 || relationsVis > 0.22)
      ) {
        setChapter("05", "cream");
        lastDocumentChapter = { id: "05", surface: "cream" };
        return;
      }

      if (
        hasRelations &&
        relationsVis > 0.22 &&
        relationsDist <= perfDist + 20
      ) {
        const eyebrow = relationsSection()?.querySelector<HTMLElement>(
          ".lineage-section__chapter, .lineage-section__masthead",
        );
        const eyebrowTop = eyebrow?.getBoundingClientRect().top ?? Infinity;
        const stageEdge = (1 - release) * vh;
        const inRevealedBand =
          release >= 0.42 &&
          eyebrowTop < vh * 0.82 &&
          eyebrowTop > stageEdge - 8;

        if (!inRevealedBand && perfVis > 0.12 && release < 0.95) {
          setChapter("05", "cream");
          lastDocumentChapter = { id: "05", surface: "cream" };
          return;
        }

        setChapter("05", "cream");
        lastDocumentChapter = { id: "05", surface: "cream" };
        return;
      }

      /* Reading plate still owns the band — and release has not finished. */
      if (perfVis > 0.18 && release < 0.95) {
        setChapter("05", "cream");
        lastDocumentChapter = { id: "05", surface: "cream" };
        return;
      }

      if (criterioVis > 0.18 || footerVis > 0.12) {
        setChapter("05", "cream");
        lastDocumentChapter = { id: "05", surface: "cream" };
        return;
      }

      /*
       * Past Performance / Relations (criterio, footer, trailing document):
       * retain the last valid chapter — never invent 06.
       */
      if (lastDocumentChapter && (heroPhase === "document" || heroChapter === "active")) {
        const pastPerf = !perfRect || perfRect.bottom < vh * 0.28;
        const pastRelations =
          !hasRelations || !relationsRect || relationsRect.bottom < vh * 0.28;
        if (pastPerf && pastRelations) {
          setChapter(lastDocumentChapter.id, lastDocumentChapter.surface);
          return;
        }
        if (release >= 0.95) {
          setChapter("05", "cream");
          lastDocumentChapter = { id: "05", surface: "cream" };
          return;
        }
      }

      /* Early document rise — still finishing firma / approaching notes */
      if (heroChapter === "active" || heroPhase === "document") {
        if (notesVis > 0.02 || archVis > 0.02) {
          setChapter(
            notesVis >= archVis ? "03" : "02",
            notesVis >= archVis ? "cream" : "dark",
          );
          return;
        }
        if (lastDocumentChapter) {
          setChapter(lastDocumentChapter.id, lastDocumentChapter.surface);
          return;
        }
        setChapter("02", "dark");
        return;
      }

      setChapter("01", "dark");
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        resolve();
      });
    };

    resolve();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    const shellObserver = shell
      ? new MutationObserver(onScroll)
      : null;
    if (shell && shellObserver) {
      shellObserver.observe(shell, {
        attributes: true,
        attributeFilter: ["data-hero-phase", "data-hero-chapter"],
      });
    }

    const archEl = archSection();
    const archObserver = archEl
      ? new MutationObserver(onScroll)
      : null;
    if (archEl && archObserver) {
      archObserver.observe(archEl, {
        attributes: true,
        attributeFilter: ["data-rail-conceal", "data-phase", "data-exploring"],
      });
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
      shellObserver?.disconnect();
      archObserver?.disconnect();
    };
  }, []);

  return (
    <div
      className="perfume-chapter-rail"
      data-surface={surface}
      data-chapter={current}
      data-concealed={concealed ? "true" : "false"}
    >
      <HeroChapterIndex current={current} chapters={chapters} />
    </div>
  );
}
