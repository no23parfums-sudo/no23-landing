"use client";

import { useEffect, useState } from "react";
import { HeroChapterIndex } from "./hero/HeroChapterIndex";

type Surface = "dark" | "cream";

/**
 * Persistent left chapter rail for the full perfume page.
 * Visual treatment matches the Hero index; active id tracks dominant section:
 * 01 Hero · 02 Firma reveal · 03 Signature Notes · 04 Arquitectura
 * 05 Performance · 06 La línea
 *
 * When Architecture exposes left-side annotations, the rail softly conceals
 * (still chapter 04 in page state) so labels can use that space.
 */
export function PerfumeChapterRail() {
  const [current, setCurrent] = useState("01");
  const [surface, setSurface] = useState<Surface>("dark");
  const [concealed, setConcealed] = useState(false);

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
    const lineageSection = () =>
      document.querySelector<HTMLElement>(".lineage-section");

    let frame = 0;

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

    const resolve = () => {
      const vh = window.innerHeight;
      const heroPhase = shell?.dataset.heroPhase ?? "hero";
      const heroChapter = shell?.dataset.heroChapter ?? "idle";
      const arch = archSection();
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
        return;
      }

      if (archReadable) {
        setChapter("04", "dark");
        return;
      }

      const perfRect = performanceSection()?.getBoundingClientRect();
      const lineageRect = lineageSection()?.getBoundingClientRect();
      const perfVis = visibleRatio(perfRect, vh);
      const lineageVis = visibleRatio(lineageRect, vh);
      const perfDist = midDistance(perfRect, vh);
      const lineageDist = midDistance(lineageRect, vh);

      if (lineageVis > 0.22 && lineageDist <= perfDist + 20) {
        setChapter("06", "cream");
        return;
      }

      if (perfVis > 0.18) {
        setChapter("05", "cream");
        return;
      }

      /* Early document rise — still finishing firma / approaching notes */
      if (heroChapter === "active" || heroPhase === "document") {
        setChapter(
          notesVis >= archVis ? "03" : "02",
          notesVis >= archVis ? "cream" : "dark",
        );
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
      <HeroChapterIndex current={current} />
    </div>
  );
}
