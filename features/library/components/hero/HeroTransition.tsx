"use client";

import {
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";

type HeroTransitionProps = {
  /** When false, skip Chapter 02 rail/reveal (active record has no notes) */
  hasChapterReveal?: boolean;
  /** When true, static↔Film A media ownership participates in firma-progress */
  hasFirmaFilm?: boolean;
  children: (api: {
    pinRef: RefObject<HTMLElement | null>;
    entered: boolean;
    /** Active chapter id along the Hero → archive handoff ("01" | "02") */
    activeChapter: string;
  }) => ReactNode;
};

const clamp01 = (n: number) => Math.min(1, Math.max(0, n));

function smoothstep(edge0: number, edge1: number, x: number) {
  if (edge0 === edge1) return x < edge0 ? 0 : 1;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/**
 * Hero scroll progress where the Hero→Firma scene is fully settled.
 * Lives inside existing pin travel — before notes/document (NOTES_START).
 */
const FIRMA_SCENE_END = 0.42;
/** Notes / cream may begin after Firma is settled */
const NOTES_START = 0.46;

/** Rail 02 — hysteresis on firma-progress (not a visual gate) */
const RAIL_CHAPTER_ON = 0.32;
const RAIL_CHAPTER_OFF = 0.16;

function writeTokens(
  shell: HTMLElement | null,
  values: {
    progress: number;
    firmaProgress: number;
    photo: number;
    ui: number;
    doc: number;
    chapterReveal: number;
    filmOpacity: number;
    staticOpacity: number;
    depthBg: string;
    depthUi: string;
  },
) {
  if (!shell) return;
  shell.style.setProperty("--hero-progress", values.progress.toFixed(4));
  shell.style.setProperty(
    "--firma-progress",
    values.firmaProgress.toFixed(4),
  );
  shell.style.setProperty("--hero-photo-fade", values.photo.toFixed(4));
  shell.style.setProperty("--hero-ui-fade", values.ui.toFixed(4));
  shell.style.setProperty("--hero-doc-rise", values.doc.toFixed(4));
  shell.style.setProperty(
    "--hero-chapter-reveal",
    values.chapterReveal.toFixed(4),
  );
  shell.style.setProperty(
    "--firma-film-opacity",
    values.filmOpacity.toFixed(4),
  );
  shell.style.setProperty(
    "--firma-static-opacity",
    values.staticOpacity.toFixed(4),
  );
  shell.style.setProperty("--hero-depth-bg", values.depthBg);
  shell.style.setProperty("--hero-depth-ui", values.depthUi);
}

function clearTokens(shell: HTMLElement | null) {
  writeTokens(shell, {
    progress: 0,
    firmaProgress: 0,
    photo: 0,
    ui: 0,
    doc: 0,
    chapterReveal: 0,
    filmOpacity: 0,
    staticOpacity: 1,
    depthBg: "0vh",
    depthUi: "0vh",
  });
  if (shell) {
    shell.dataset.heroPhase = "hero";
    shell.dataset.contentPlane = "empty";
    shell.dataset.heroChapter = "idle";
  }
}

/**
 * ONE continuous Hero→Firma scene driven by --firma-progress (0→1).
 *
 * Conceptual map (firma-progress):
 *  0.00  Hero settled
 *  0.15  Hero begins releasing
 *  0.25  Firma copy entering · film ready / mostly hidden
 *  0.35  Film play() · Hero media loses ownership
 *  0.50  Brief coexist · film clearly moving
 *  0.65  Firma owns
 *  1.00  Firma settled · film playing
 *
 * Notes/document remain after FIRMA_SCENE_END — unchanged architecture.
 */
export function HeroTransition({
  hasChapterReveal = true,
  hasFirmaFilm = false,
  children,
}: HeroTransitionProps) {
  const pinRef = useRef<HTMLElement>(null);
  const [entered, setEntered] = useState(false);
  const [activeChapter, setActiveChapter] = useState("01");
  const reduceMotion = useReducedMotion();
  const reduceMotionRef = useRef(reduceMotion);
  const hasChapterRef = useRef(hasChapterReveal);
  const hasFirmaFilmRef = useRef(hasFirmaFilm);
  const shellRef = useRef<HTMLElement | null>(null);
  const chapterLatchedRef = useRef(false);

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });

  reduceMotionRef.current = reduceMotion;
  hasChapterRef.current = hasChapterReveal;
  hasFirmaFilmRef.current = hasFirmaFilm;

  useEffect(() => {
    const id = window.requestAnimationFrame(() => setEntered(true));
    return () => window.cancelAnimationFrame(id);
  }, []);

  const applyProgress = (p: number) => {
    if (!shellRef.current) {
      shellRef.current = document.querySelector<HTMLElement>(
        "[data-perfume-shell]",
      );
    }
    const shell = shellRef.current;
    if (reduceMotionRef.current) {
      clearTokens(shell);
      chapterLatchedRef.current = false;
      setActiveChapter("01");
      return;
    }

    const progress = clamp01(p);
    const withChapter = hasChapterRef.current;

    if (shell) {
      shell.dataset.contentPlane = withChapter ? "notes" : "empty";
    }

    const depthBg = `${(-progress * 1.35).toFixed(3)}vh`;
    const depthUi = `${(-progress * 0.35).toFixed(3)}vh`;

    /* ── Master Hero→Firma progress (0→1) ── */
    const firmaProgress = withChapter
      ? clamp01(progress / FIRMA_SCENE_END)
      : 0;

    /*
     * Rail latch — light hysteresis only. Does NOT gate visuals or film.
     */
    if (withChapter) {
      if (!chapterLatchedRef.current && firmaProgress >= RAIL_CHAPTER_ON) {
        chapterLatchedRef.current = true;
      } else if (
        chapterLatchedRef.current &&
        firmaProgress < RAIL_CHAPTER_OFF
      ) {
        chapterLatchedRef.current = false;
      }
    } else {
      chapterLatchedRef.current = false;
    }

    const latched = withChapter && chapterLatchedRef.current;
    const firmaSettled = !withChapter || firmaProgress >= 0.98;

    /* Hero editorial exit — continuous from first scroll (no dead plateau) */
    let ui: number;
    if (withChapter) {
      ui = smoothstep(0, 0.42, firmaProgress);
    } else {
      ui = clamp01((progress - 0.02) / 0.18);
    }

    /*
     * Firma editorial enter — slot resolves early so line-level CSS stagger
     * (eyebrow / title / lede off --firma-progress) can read as one composition.
     */
    let chapterReveal = 0;
    if (withChapter) {
      chapterReveal = smoothstep(0.12, 0.32, firmaProgress);
      if (progress >= NOTES_START) {
        const exit = smoothstep(NOTES_START, NOTES_START + 0.22, progress);
        chapterReveal *= 1 - exit;
      }
    }

    /*
     * Media ownership — short overlap only (~25% of firma-progress):
     * static 1→0 from 25–55%, film 0→1 from 30–55%.
     * Only when Film A exists; otherwise static stays.
     */
    let staticOpacity = 1;
    let filmOpacity = 0;
    if (withChapter && hasFirmaFilmRef.current) {
      staticOpacity = 1 - smoothstep(0.25, 0.55, firmaProgress);
      filmOpacity = smoothstep(0.3, 0.55, firmaProgress);
    }

    let doc = 0;
    let photo = 0;
    if (!withChapter) {
      const docRaw = clamp01((progress - 0.32) / 0.58);
      doc = Math.pow(docRaw, 0.85);
      photo = clamp01((progress - 0.3) / 0.55);
    } else if (firmaSettled && progress >= NOTES_START) {
      /*
       * Previous working Firma → Notes ownership:
       * cream rises immediately over the still-living atmosphere/Film A.
       * --hero-photo-fade releases the photo only after doc is established.
       * Do NOT blank Film A here — that created the black dead viewport.
       */
      const docRaw = clamp01(
        (progress - NOTES_START) / (1 - NOTES_START - 0.02),
      );
      doc = Math.pow(docRaw, 0.42);
      photo = clamp01((doc - 0.55) / 0.45);
      if (hasFirmaFilmRef.current) {
        filmOpacity = 1;
        staticOpacity = 0;
      }
    }

    if (withChapter && progress >= 0.995) {
      doc = 1;
      photo = Math.max(photo, clamp01((doc - 0.55) / 0.45));
      if (hasFirmaFilmRef.current) {
        filmOpacity = 1;
        staticOpacity = 0;
      }
    }

    writeTokens(shell, {
      progress,
      firmaProgress,
      photo,
      ui,
      doc,
      chapterReveal,
      filmOpacity,
      staticOpacity,
      depthBg,
      depthUi,
    });

    if (shell) {
      if (latched && firmaSettled) shell.dataset.heroChapter = "active";
      else if (latched) shell.dataset.heroChapter = "settling";
      else shell.dataset.heroChapter = "idle";
    }

    /*
     * Phase labels for rail/a11y — derived from same progress.
     * Chapter phase begins when Firma editorial takes ownership (~0.32),
     * not only at media settle — so the rail tracks the continuous scene.
     */
    const phase =
      doc > 0.04
        ? "document"
        : withChapter && firmaProgress >= RAIL_CHAPTER_ON
          ? "chapter"
          : withChapter && firmaProgress >= 0.04
            ? "retreat"
            : "hero";
    if (shell && shell.dataset.heroPhase !== phase) {
      shell.dataset.heroPhase = phase;
    }

    const nextChapter = latched ? "02" : "01";
    setActiveChapter((prev) => (prev === nextChapter ? prev : nextChapter));
  };

  useMotionValueEvent(scrollYProgress, "change", applyProgress);

  useEffect(() => {
    chapterLatchedRef.current = false;
    shellRef.current = document.querySelector<HTMLElement>(
      "[data-perfume-shell]",
    );
    applyProgress(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion, scrollYProgress, hasChapterReveal, hasFirmaFilm]);

  return <>{children({ pinRef, entered, activeChapter })}</>;
}
