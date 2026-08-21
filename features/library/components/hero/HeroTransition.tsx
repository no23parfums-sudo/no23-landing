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
import {
  hasReachedSignatureNotes,
  isForwardFilmReady,
  markSignatureNotesReached,
  rearmForwardFilm,
} from "../../lib/discoveryState";

type HeroTransitionProps = {
  /** When false, skip Chapter 02 rail/reveal (active record has no notes) */
  hasChapterReveal?: boolean;
  /** When true, static↔Film A media ownership participates in firma-progress */
  hasFirmaFilm?: boolean;
  /** Prototype split — no Firma film, no parked document rise. */
  layout?: "current" | "split";
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
  layout = "current",
  children,
}: HeroTransitionProps) {
  const pinRef = useRef<HTMLElement>(null);
  const [entered, setEntered] = useState(false);
  const [activeChapter, setActiveChapter] = useState("01");
  const reduceMotion = useReducedMotion();
  const reduceMotionRef = useRef(reduceMotion);
  const hasChapterRef = useRef(hasChapterReveal);
  const hasFirmaFilmRef = useRef(hasFirmaFilm);
  const isSplitRef = useRef(layout === "split");
  const shellRef = useRef<HTMLElement | null>(null);
  const chapterLatchedRef = useRef(false);
  /** Reverse-only media smoothing — never applied on first-discovery forward. */
  const lastProgressRef = useRef(0);
  const lastTsRef = useRef(
    typeof performance !== "undefined" ? performance.now() : 0,
  );
  const reverseLatchRef = useRef<
    "none" | "skip-hero" | "film" | "hero"
  >("none");
  /**
   * Reverse-only type ownership — survives one noisy forward sample
   * while firmaProgress is still in the Hero↔Firma zone.
   */
  const reverseTypeGuardRef = useRef(false);
  /** Firma was perceptibly readable; hold until it drops below release. */
  const firmaHoldRef = useRef(false);
  /** Fast-reverse pass — blank-bridge only; slow reverse curves stay intact. */
  const wasFastReverseRef = useRef(false);
  const displayFilmRef = useRef(0);
  const displayStaticRef = useRef(1);

  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset:
      layout === "split"
        ? ["start start", "end start"]
        : ["start start", "end end"],
  });

  reduceMotionRef.current = reduceMotion;
  hasChapterRef.current = hasChapterReveal;
  hasFirmaFilmRef.current = hasFirmaFilm;
  isSplitRef.current = layout === "split";

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
    const progress = clamp01(p);

    if (isSplitRef.current) {
      /* Hero finishes in place — no UI recede into the next chapter. */
      const ui = 0;
      const headerRise = smoothstep(0.62, 1, progress);
      writeTokens(shell, {
        progress,
        firmaProgress: 0,
        photo: 0,
        ui,
        doc: headerRise,
        chapterReveal: 0,
        filmOpacity: 0,
        staticOpacity: 1,
        depthBg: "0vh",
        depthUi: "0vh",
      });
      if (shell) {
        shell.dataset.contentPlane = "empty";
        shell.dataset.heroChapter = "idle";
        shell.dataset.heroPhase = progress > 0.7 ? "document" : "hero";
      }
      setActiveChapter("01");
      return;
    }

    if (reduceMotionRef.current) {
      clearTokens(shell);
      chapterLatchedRef.current = false;
      setActiveChapter("01");
      return;
    }

    const withChapter = hasChapterRef.current;
    const now =
      typeof performance !== "undefined" ? performance.now() : 0;
    const dt = Math.max(1, now - lastTsRef.current);
    const dProgress = progress - lastProgressRef.current;
    const pinH = pinRef.current?.offsetHeight ?? window.innerHeight * 2.35;
    const velocity = (dProgress * pinH) / (dt / 1000);
    const reversing = dProgress < -0.0005;
    /* Fast reverse / fling only — forward discovery stays sample-accurate.
     * Per-tick velocity from ~16ms motion samples is huge even on a 40px
     * wheel; skip-to-Hero must require a realistic fling (≈220px+), not
     * a normal reverse through Firma. */
    const fastReverse =
      reversing &&
      (Math.abs(velocity) >= 8000 || Math.abs(dProgress) > 0.11);
    lastProgressRef.current = progress;
    lastTsRef.current = now;

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
     * Reverse-only typography seam — Firma slot yields before Hero identity
     * is readable. Forward curves unchanged. Media tokens are not touched.
     */
    if (withChapter && reversing) {
      ui = smoothstep(0, 0.24, firmaProgress);
      chapterReveal = smoothstep(0.24, 0.42, firmaProgress);
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
    /*
     * Directional Film ownership:
     *  - first discovery / downward after Hero rest: existing curves
     *  - upward after Signature: skip Film (static Hero under document)
     */
    const skipFilm =
      hasReachedSignatureNotes() && !isForwardFilmReady();
    if (withChapter && hasFirmaFilmRef.current && !skipFilm) {
      if (fastReverse) {
        /* Wider reverse-only crossfade — no hard ownership flip on fling. */
        staticOpacity = 1 - smoothstep(0.18, 0.62, firmaProgress);
        filmOpacity = smoothstep(0.22, 0.62, firmaProgress);
      } else {
        staticOpacity = 1 - smoothstep(0.25, 0.55, firmaProgress);
        filmOpacity = smoothstep(0.3, 0.55, firmaProgress);
      }
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
      if (hasFirmaFilmRef.current && !skipFilm) {
        filmOpacity = 1;
        staticOpacity = 0;
      }
    }

    if (withChapter && progress >= 0.995) {
      doc = 1;
      photo = Math.max(photo, clamp01((doc - 0.55) / 0.45));
      if (hasFirmaFilmRef.current && !skipFilm) {
        filmOpacity = 1;
        staticOpacity = 0;
      }
    }

    /*
     * Notes must fully own the cream plane before the intro is spent.
     * Do not latch during Hero, Film A, Firma, or the partial Notes rise.
     */
    if (
      withChapter &&
      firmaSettled &&
      progress >= 0.94 &&
      doc >= 0.96
    ) {
      markSignatureNotesReached();
    }

    if (dProgress > 0.0005) {
      reverseLatchRef.current = "none";
    }

    /*
     * Reverse type ownership — typography only.
     * Forward curves are not rewritten. Guard stays armed across a
     * single noisy forward sample while still inside the transition zone.
     */
    const inTypeZone = withChapter && firmaProgress > 0.02 && firmaProgress < 0.96;
    if (reversing || fastReverse) {
      reverseTypeGuardRef.current = true;
    } else if (!inTypeZone) {
      reverseTypeGuardRef.current = false;
    }
    if (fastReverse) wasFastReverseRef.current = true;
    if (firmaProgress <= 0.02) {
      reverseTypeGuardRef.current = false;
      firmaHoldRef.current = false;
      wasFastReverseRef.current = false;
    }
    if (chapterReveal > 0.16) firmaHoldRef.current = true;
    if (chapterReveal < 0.1) firmaHoldRef.current = false;

    if (
      withChapter &&
      reverseTypeGuardRef.current &&
      chapterReveal > 0.12 &&
      (firmaHoldRef.current || chapterReveal > 0.14)
    ) {
      ui = 1;
    } else if (
      withChapter &&
      wasFastReverseRef.current &&
      chapterReveal <= 0.12 &&
      1 - ui <= 0.12
    ) {
      ui = 0.85;
    }

    if (skipFilm && hasFirmaFilmRef.current) {
      const latch = reverseLatchRef.current;
      if (fastReverse || latch === "skip-hero") {
        reverseLatchRef.current = "skip-hero";
        filmOpacity = 0;
        staticOpacity = 1;
      } else if (latch === "hero") {
        filmOpacity = 0;
        staticOpacity = 1;
      } else if (progress >= NOTES_START || firmaProgress >= 0.12) {
        reverseLatchRef.current = "film";
        filmOpacity = 1;
        staticOpacity = 0;
      } else {
        reverseLatchRef.current = "hero";
        filmOpacity = 0;
        staticOpacity = 1;
      }
    }

    /*
     * Re-arm only at genuine Hero rest, once static owns and Film is gone.
     * Allow the reverse landing frame (do not require !reversing) so a
     * one-shot arrival still rearms. Never re-arm mid-Firma / mid-Notes.
     */
    if (
      hasReachedSignatureNotes() &&
      progress <= 0.02 &&
      staticOpacity >= 0.99 &&
      filmOpacity <= 0.01
    ) {
      rearmForwardFilm();
    }

    /*
     * Reverse-only temporal smooth (~160ms) of media tokens.
     * Forward path writes exact scroll-mapped values (first discovery intact).
     * Upward after Signature skips Film — do not smooth a rebuild.
     */
    let outFilm = filmOpacity;
    let outStatic = staticOpacity;
    if (
      fastReverse &&
      withChapter &&
      hasFirmaFilmRef.current &&
      !skipFilm
    ) {
      const alpha = 1 - Math.exp(-dt / 140);
      displayFilmRef.current += (filmOpacity - displayFilmRef.current) * alpha;
      displayStaticRef.current +=
        (staticOpacity - displayStaticRef.current) * alpha;
      outFilm = displayFilmRef.current;
      outStatic = Math.max(
        displayStaticRef.current,
        1 - outFilm * 0.9,
      );
      /* Landed on Hero — finish the handoff (no lingering film veil). */
      if (progress <= 0.02) {
        outFilm = 0;
        outStatic = 1;
        displayFilmRef.current = 0;
        displayStaticRef.current = 1;
      }
    } else {
      displayFilmRef.current = filmOpacity;
      displayStaticRef.current = staticOpacity;
    }

    writeTokens(shell, {
      progress,
      firmaProgress,
      photo,
      ui,
      doc,
      chapterReveal,
      filmOpacity: outFilm,
      staticOpacity: outStatic,
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
    lastProgressRef.current = 0;
    reverseLatchRef.current = "none";
    reverseTypeGuardRef.current = false;
    firmaHoldRef.current = false;
    wasFastReverseRef.current = false;
    displayFilmRef.current = 0;
    displayStaticRef.current = 1;
    shellRef.current = document.querySelector<HTMLElement>(
      "[data-perfume-shell]",
    );
    applyProgress(scrollYProgress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduceMotion, scrollYProgress, hasChapterReveal, hasFirmaFilm, layout]);

  return <>{children({ pinRef, entered, activeChapter })}</>;
}
