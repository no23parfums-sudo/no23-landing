"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  hasSeenPerformanceRelease,
  isNavigating,
  isPerformanceSettled,
  markPerformanceDiscovering,
  markPerformanceReleaseSeen,
  markPerformanceSettled,
  NAV_VELOCITY,
} from "../../lib/discoveryState";
import type { MatterMode } from "./performanceMatter";

gsap.registerPlugin(ScrollTrigger);

export const PERFORMANCE_METRICS = [
  "longevity",
  "projection",
  "sillage",
  "season",
  "occasion",
  "versatility",
] as const;

export type PerformanceMetricId = (typeof PERFORMANCE_METRICS)[number];

type SetupOptions = {
  section: HTMLElement;
  reduceMotion?: boolean;
  signal?: AbortSignal;
  onField?: (state: {
    build: number;
    breathe: number;
    mode: MatterMode;
    morph: number;
    metricIndex: number;
  }) => void;
};

/** Freeze Overview/metrics without mutating section height. */
function markSettledFlags(section: HTMLElement) {
  markPerformanceSettled();
  section.dataset.perfSmoke = "done";
  section.dataset.performanceState = "settled";
  section.dataset.perfHold = hasSeenPerformanceRelease()
    ? "revisit"
    : "discovery";
  section.querySelectorAll<HTMLVideoElement>(
    ".performance-section__smoke-video",
  ).forEach((smokeVideo) => {
    try {
      smokeVideo.pause();
    } catch {
      /* ignore */
    }
  });
}

function visPx(el: HTMLElement | null, vh: number) {
  if (!el) return 0;
  const cs = getComputedStyle(el);
  if (cs.visibility === "hidden" || cs.display === "none") return 0;
  const r = el.getBoundingClientRect();
  return Math.max(0, Math.min(vh, r.bottom) - Math.max(0, r.top));
}

/** Stage layout ∩ viewport, reduced by the release clip (inset from bottom). */
function clippedPlatePx(section: HTMLElement, vh: number) {
  const stage = section.querySelector<HTMLElement>(
    ".performance-section__stage",
  );
  if (!stage) return 0;
  const r = stage.getBoundingClientRect();
  const layout = Math.max(0, Math.min(vh, r.bottom) - Math.max(0, r.top));
  const release = parseFloat(
    section.style.getPropertyValue("--perf-release") || "0",
  );
  return layout * (1 - Math.max(0, Math.min(1, release)));
}

/**
 * Discovery 950vh → revisit 190vh.
 *
 * Safe only after FULL OVERVIEW has been seen AND La Línea (or the
 * clipped remainder) owns the viewport. The Overview plate is not the
 * visual owner, so shrinking the spent runway is not a plate teleport.
 *
 * Scroll is restored so the Linea (or Architecture) anchor keeps the
 * same viewport top — one-time, not per-frame.
 */
function commitRevisitGeometry(section: HTMLElement) {
  if (section.dataset.perfGeom === "settled") return;
  if (section.dataset.perfCollapsing === "1") return;
  const overviewSeen =
    section.dataset.perfOverviewSeen === "1" || isPerformanceSettled();
  if (!overviewSeen) return;

  const vh = window.innerHeight;
  const rect = section.getBoundingClientRect();
  const fullyBelow = rect.top >= vh - 1;

  const sheet = section.closest(".perfume-document__sheet");
  const linea =
    sheet?.querySelector<HTMLElement>(
      ":scope > .perfume-relations, :scope > .lineage-section",
    ) ?? null;
  const plate = clippedPlatePx(section, vh);
  const lineaPx = visPx(linea, vh);
  const lineaShown =
    !!linea && getComputedStyle(linea).visibility !== "hidden";
  const lineaOwns =
    lineaShown && lineaPx >= vh * 0.72 && plate <= vh * 0.32;
  const pastPlate =
    lineaShown && plate <= vh * 0.18 && lineaPx >= vh * 0.55;

  if (!fullyBelow && !lineaOwns && !pastPlate) return;

  const html = document.documentElement;
  const scroller = document.scrollingElement ?? html;
  const prevAnchor = html.style.overflowAnchor;
  html.style.overflowAnchor = "none";

  const anchor = fullyBelow ? null : linea;
  const savedTop = anchor?.getBoundingClientRect().top ?? 0;

  section.dataset.perfCollapsing = "1";
  markPerformanceReleaseSeen();
  markPerformanceSettled();
  section.dataset.perfVisit = "settled";
  section.dataset.perfGeom = "settled";
  section.dataset.perfLife = "revisit";
  markSettledFlags(section);
  /*
   * Collapse runs only when Linea/Criterio already owns the field.
   * Restoring a partial --perf-release (often ~0.82–0.84 on first
   * discovery) left a leftover sticky plate over Criterio.
   */
  section.style.setProperty("--perf-release", "1");
  void section.offsetHeight;

  const restore = () => {
    if (!anchor) return;
    const drift = anchor.getBoundingClientRect().top - savedTop;
    if (Math.abs(drift) > 0.5) scroller.scrollTop += drift;
  };
  restore();
  restore();

  requestAnimationFrame(() => {
    ScrollTrigger.refresh();
    restore();
    section.style.setProperty("--perf-release", "1");
    html.style.overflowAnchor = prevAnchor;
    delete section.dataset.perfCollapsing;
  });
}

/**
 * Native smoke loop.
 * The corrected MP4 no longer encodes a Hero/still at the seam,
 * so dual-video crossfade / mid-file truncation is not used.
 */
function syncSmokePlayback(
  section: HTMLElement,
  active: boolean,
  reduceMotion: boolean,
) {
  const videos = section.querySelectorAll<HTMLVideoElement>(
    ".performance-section__smoke-video",
  );
  if (!videos.length) return;

  if (!active || reduceMotion || isPerformanceSettled()) {
    videos.forEach((video) => {
      try {
        video.pause();
      } catch {
        /* ignore */
      }
    });
    section.classList.remove("is-smoke-looping");
    return;
  }

  section.classList.add("is-smoke-looping");
  videos.forEach((video) => {
    video.muted = true;
    video.loop = true;
    video.style.opacity = "1";
  });
  const owner = videos[0];
  const play = owner.play();
  if (play && typeof play.catch === "function") play.catch(() => undefined);
}

/** Progressive Smoke ownership behind metrics — opacity only, not timeline. */
function smokeBehindMetric(metricIndex: number): number {
  if (metricIndex <= 0) return 0.64; /* 01 — clearly perceptible */
  if (metricIndex <= 2) return 0.34; /* 02–03 — atmospheric */
  return 0.14; /* 04–06 — subtle moving residue */
}

/**
 * Full Performance chapter scroll map.
 *
 * Discovery:
 *   Smoke opening (time-played video + identity)
 *   → matter emergence → 6 metrics → Overview
 *
 * Settled: compact panoramic Overview (no Smoke replay).
 */
export async function setupPerformanceRuntime({
  section,
  reduceMotion = false,
  signal,
  onField,
}: SetupOptions): Promise<() => void> {
  if (signal?.aborted) return () => undefined;
  await Promise.resolve();
  if (signal?.aborted) return () => undefined;

  const METRIC_COUNT = PERFORMANCE_METRICS.length;
  /* Post-pin local shares — mapped onto the 900vh-equivalent prefix.
   * Extra CSS height after that prefix is release travel (no mid-beat collapse). */
  const SMOKE_SHARE = 0.075; /* ~short cinematic opening, not a runway */
  /*
   * FULL PERFORMANCE OVERVIEW — mandatory narrative beat (not “extra vh”).
   *
   * Hitch root cause (removed): collapseSettledGeometry() ran at SETTLE_AT
   * while the plate was still on-screen (window.scrollTo + ScrollTrigger.refresh).
   *
   * First discovery now keeps geometry stable through:
   *   assemble → FULL OVERVIEW (release=0) → native release travel → onLeave collapse.
   * 01–06 absolute travel is unchanged (mapped through DISCOVERY_END).
   */
  const OVERVIEW_SHARE = 0.12;
  /** Within overview share: when visual --perf-overview reaches 1. */
  const OV_ASSEMBLE_END = 0.52;
  const METRICS_SHARE = 1 - SMOKE_SHARE - OVERVIEW_SHARE;
  const SLOT = METRICS_SHARE / METRIC_COUNT;
  const REVEAL_END = 0.22;
  const HOLD_END = 0.77;
  /**
   * Visual FULL OVERVIEW locks here (confirm). Remaining prefix travel is
   * the stable reading beat with release gated at 0 — no geometry mutation.
   */
  const SETTLE_AT = 0.62;
  /** 900vh prefix / 950vh discovery runway — extra post-pin is release only. */
  const DISCOVERY_END = 8 / 8.5;

  /** Map raw overview travel → visual plate progress (assemble then lock at 1). */
  const mapOverviewVisual = (ovRaw: number) => {
    const raw = Math.max(0, Math.min(1, ovRaw));
    if (raw <= OV_ASSEMBLE_END) return raw / OV_ASSEMBLE_END;
    return 1;
  };

  let lastKey = "";
  const lastVars: Record<string, string> = {};
  let smokeStarted = false;

  const setVar = (name: string, value: string) => {
    if (lastVars[name] === value) return;
    lastVars[name] = value;
    section.style.setProperty(name, value);
  };

  const setData = (key: string, value: string) => {
    if (section.dataset[key] === value) return;
    section.dataset[key] = value;
  };

  const sheet = section.closest(".perfume-document__sheet") as HTMLElement | null;

  const resolveLinea = () =>
    sheet?.querySelector<HTMLElement>(
      ":scope > .perfume-relations, :scope > .lineage-section",
    ) ?? null;

  const writeRelease = (t: number) => {
    const v = Math.max(0, Math.min(1, t)).toFixed(4);
    section.style.setProperty("--perf-release", v);
    /*
     * Unhide La Línea as soon as the clip opens so the ivory band is
     * never empty. HOLD keeps t=0 through the Overview reading beat, so
     * this cannot leak during PERFORMANCE_SETTLED.
     */
    if (t >= 0.02) {
      section.dataset.perfReleasing = "true";
      if (sheet) {
        sheet.style.setProperty("--perf-release", v);
        sheet.dataset.perfReleasing = "true";
      }
    } else {
      delete section.dataset.perfReleasing;
      if (sheet) {
        sheet.style.setProperty("--perf-release", v);
        delete sheet.dataset.perfReleasing;
      }
    }
    if (t < 0.02) section.dataset.perfOwn = "settled";
    else if (t < 0.98) section.dataset.perfOwn = "transition";
    else section.dataset.perfOwn = "linea";
    if (
      section.dataset.perfVisit === "settled" ||
      section.dataset.perfGeom === "settled"
    ) {
      section.style.background =
        t < 0.08 ? "var(--perf-bg)" : "transparent";
    } else {
      section.style.removeProperty("background");
    }
  };

  const clearSheetRelease = () => {
    if (!sheet) return;
    sheet.style.removeProperty("--perf-release");
    delete sheet.dataset.perfReleasing;
  };

  let sawReleaseMotion = false;

  const headerBottomPx = () => {
    const header = document.querySelector<HTMLElement>(".library-header");
    return header?.getBoundingClientRect().bottom ?? 84;
  };

  const criterioOwnsOrEnd = () => {
    const vh = window.innerHeight || 1;
    const guidance = sheet?.querySelector<HTMLElement>(".no23-guidance");
    const gVis =
      !!guidance && getComputedStyle(guidance).visibility !== "hidden";
    const gTop = guidance?.getBoundingClientRect().top ?? vh * 2;
    const criterioOwns = gVis && gTop < vh * 0.55;
    const scroller = document.scrollingElement ?? document.documentElement;
    const atDocumentEnd =
      window.scrollY + vh >= scroller.scrollHeight - 16;
    return criterioOwns || atDocumentEnd;
  };

  /**
   * Source of truth: La Línea physical sheet top.
   * clip inset-from-bottom so visible Performance bottom == lineaTop.
   * Criterio / document end still force a complete clip (stale-plate fix).
   */
  const releaseFromLineaEdge = () => {
    if (criterioOwnsOrEnd()) return 1;
    const linea = resolveLinea();
    if (!linea) return 0;
    const vh = window.innerHeight || 1;
    const lineaTop = linea.getBoundingClientRect().top;
    const headerBottom = headerBottomPx();
    if (lineaTop <= headerBottom + 1) return 1;
    if (lineaTop >= vh) return 0;
    return 1 - lineaTop / vh;
  };

  const writeEdgeRelease = () => {
    const release = releaseFromLineaEdge();
    if (release > 0.12) sawReleaseMotion = true;
    writeRelease(release);
    return release < 0.02 ? ("full" as const) : ("idle" as const);
  };

  const writePostOverviewRelease = (_tScroll: number) => writeEdgeRelease();

  if (isPerformanceSettled()) {
    section.dataset.perfVisit = "settled";
    section.dataset.perfGeom = "settled";
    section.dataset.perfSmoke = "done";
    section.dataset.performanceState = "settled";
    section.dataset.perfHold = hasSeenPerformanceRelease()
      ? "revisit"
      : "discovery";
  } else {
    section.dataset.performanceState = "discovering";
    section.dataset.perfHold = "discovery";
    section.dataset.perfLife = "discovering";
  }

  const applyProgress = (
    progress: number,
    pinP: number,
    navigating = false,
  ) => {
    const p = Math.max(0, Math.min(1, progress));
    const pin = Math.max(0.08, Math.min(0.16, pinP));
    if (p > 0.002) markPerformanceDiscovering();

    let intro = 1;
    let metricIndex = 0;
    let fill = 0;
    let field = 0;
    let overviewState: "idle" | "assemble" | "full" = "idle";
    let hold = 0;
    let pulse = 0;
    let label = 0;
    let morph = 0;
    let overview = 0;
    let smoke = 0;
    let identity = 0;
    let mode: MatterMode = "longevity";
    let phase:
      | "idle"
      | "smoke"
      | "intro"
      | "reveal"
      | "hold"
      | "transition"
      | "overview" = "idle";

    const settled = isPerformanceSettled();
    const geomSettled = section.dataset.perfGeom === "settled";

    if (settled) {
      phase = "overview";
      intro = 1;
      overview = 1;
      overviewState = "full";
      smoke = 0;
      identity = 0;
      metricIndex = METRIC_COUNT - 1;
      fill = 1;
      field = 0.35;
      hold = 1;
      pulse = 0.35;
      label = 1;
      morph = 0;
      mode = "overview";
      smokeStarted = false;
      syncSmokePlayback(section, false, reduceMotion);
      if (!geomSettled && p > 0.002) {
        const localFull = (p - pin) / Math.max(0.001, 1 - pin);
        if (localFull > DISCOVERY_END) {
          const tScroll = Math.min(
            1,
            (localFull - DISCOVERY_END) / Math.max(0.001, 1 - DISCOVERY_END),
          );
          overviewState = writePostOverviewRelease(tScroll);
        } else {
          writeRelease(0);
        }
      } else if (!geomSettled) {
        writeRelease(0);
      }
    } else if (p <= 0.002) {
      phase = "idle";
      intro = 0;
      field = 0;
      smoke = 0;
      identity = 0;
      smokeStarted = false;
      syncSmokePlayback(section, false, reduceMotion);
      if (!settled) writeRelease(0);
    } else if (p < pin) {
      /* Approach — smoke already owns the stage */
      phase = "smoke";
      const t = p / pin;
      intro = t;
      smoke = Math.min(1, t * 1.35);
      identity = Math.max(0, (t - 0.25) / 0.75);
      field = 0.02 * t;
      mode = "longevity";
      if (!smokeStarted && smoke > 0.15) {
        smokeStarted = true;
        syncSmokePlayback(section, true, reduceMotion);
      }
      if (!settled) writeRelease(0);
    } else {
      intro = 1;
      const localFull = (p - pin) / Math.max(0.001, 1 - pin);
      const local = Math.min(1, localFull / DISCOVERY_END);

      if (localFull > DISCOVERY_END) {
        /* Prefix FULL OVERVIEW consumed — native release on remaining pin. */
        phase = "overview";
        overview = 1;
        overviewState = "full";
        identity = 0;
        metricIndex = METRIC_COUNT - 1;
        mode = "overview";
        morph = 0;
        fill = 1;
        hold = 1;
        pulse = 0.35;
        label = 1;
        field = 0.35;
        smoke = 0;
        syncSmokePlayback(section, false, reduceMotion);
        const tScroll = Math.min(
          1,
          (localFull - DISCOVERY_END) / Math.max(0.001, 1 - DISCOVERY_END),
        );
        overviewState = writePostOverviewRelease(tScroll);
        const release = parseFloat(
          section.style.getPropertyValue("--perf-release") || "0",
        );
        if (release > 0.95) {
          markPerformanceSettled();
          markPerformanceReleaseSeen();
        }
      } else if (local < SMOKE_SHARE) {
        phase = "smoke";
        const t = local / SMOKE_SHARE;
        /* Protagonist → hand off into metric 01 residue (stay alive). */
        smoke = t < 0.55 ? 1 : 1 - ((t - 0.55) / 0.45) * 0.36;
        /*
         * Identity must stay continuous across the approach→pin boundary.
         * Approach already brings --perf-identity to 1; re-introducing from 0
         * here snapped translateY by up to 18px (visible title jump).
         * Hold at 1, then fade only as metric 01 takes the stage.
         */
        identity = t < 0.62 ? 1 : 1 - (t - 0.62) / 0.38;
        field = t < 0.45 ? t * 0.25 : 0.12 + ((t - 0.45) / 0.55) * 0.88;
        fill = t < 0.72 ? 0 : ((t - 0.72) / 0.28) * 0.35;
        morph = 0;
        mode = "longevity";
        metricIndex = 0;
        if (!settled) writeRelease(0);
        if (!smokeStarted) {
          smokeStarted = true;
          syncSmokePlayback(section, true, reduceMotion);
        }
        if (!settled) writeRelease(0);
        if (navigating) {
          smoke = Math.min(smoke, 0.4);
          field = Math.max(field, 0.55);
          /* Do not clamp identity — that snapped translateY by up to ~11px
           * when velocity crossed NAV_VELOCITY mid-smoke. Progress already
           * fades identity out before metric 01. */
        }
      } else if (local >= SMOKE_SHARE + METRICS_SHARE) {
        /*
         * 06 → assemble → FULL OVERVIEW (stable, still discovery geometry).
         * Release stays gated until DISCOVERY_END. No collapse on this beat.
         */
        phase = "overview";
        const ovLocal = local - SMOKE_SHARE - METRICS_SHARE;
        const ovRaw = Math.min(1, ovLocal / OVERVIEW_SHARE);
        overview = mapOverviewVisual(ovRaw);
        identity = 0;
        metricIndex = METRIC_COUNT - 1;
        mode = "overview";
        morph = 0;
        if (!settled) writeRelease(0);

        if (navigating) {
          /* Fast scroll: compress assemble, keep dark coverage. Fling may
           * skip the reading beat — allowed. Do not mutate geometry. */
          overview = 1;
          smoke = 0;
          fill = 1;
          field = 0.35;
          hold = 1;
          pulse = 0.35;
          label = 1;
          syncSmokePlayback(section, false, reduceMotion);
        } else {
          /* A ASSEMBLE: plate opens to visual 1 (Lectura completes near end) */
          /* B FULL OVERVIEW: overview locked at 1 — perceptible reading band */
          const assembleT = Math.min(1, overview);
          fill = 1;
          hold = 1;
          pulse = 1 - assembleT * 0.65;
          label = 1;
          field = 1 - assembleT * 0.65; /* 1 → ~0.35 */
          smoke = Math.max(0, 0.14 * (1 - overview));

          if (overview > 0.75) {
            syncSmokePlayback(section, false, reduceMotion);
          } else {
            if (!smokeStarted) smokeStarted = true;
            syncSmokePlayback(section, true, reduceMotion);
          }
        }

        /* Narrative beat: assemble → FULL OVERVIEW (release still gated). */
        if (ovRaw < SETTLE_AT) overviewState = "assemble";
        else overviewState = "full";
      } else {
        /* Metrics 01–06 — Smoke stays alive as atmospheric texture. */
        identity = 0;
        if (!settled) writeRelease(0);
        const metricLocal = local - SMOKE_SHARE;
        const rawIndex = Math.min(
          METRIC_COUNT - 1,
          Math.floor(metricLocal / SLOT),
        );
        metricIndex = rawIndex;
        mode = PERFORMANCE_METRICS[rawIndex] as MatterMode;
        const slotLocal = (metricLocal - rawIndex * SLOT) / SLOT;
        const targetSmoke = smokeBehindMetric(rawIndex);
        const prevSmoke =
          rawIndex === 0 ? 0.64 : smokeBehindMetric(rawIndex - 1);
        /* Ease hierarchy across the first third of each metric slot. */
        const blend = Math.min(1, slotLocal / 0.28);
        smoke = prevSmoke + (targetSmoke - prevSmoke) * blend;

        if (!smokeStarted) {
          smokeStarted = true;
        }
        syncSmokePlayback(section, true, reduceMotion);

        if (navigating) {
          phase = "hold";
          fill = 1;
          field = 1;
          hold = 1;
          pulse = 1;
          label = 1;
          morph = 0;
          smoke = Math.min(smoke, targetSmoke);
        } else if (slotLocal < REVEAL_END) {
          phase = "reveal";
          const t = slotLocal / REVEAL_END;
          fill = t;
          field = 0.35 + t * 0.65;
          pulse = t > 0.85 ? (t - 0.85) / 0.15 : 0;
          label = pulse;
          morph = rawIndex === 0 ? 0 : Math.max(0, 1 - t * 1.4);
        } else if (slotLocal < HOLD_END) {
          phase = "hold";
          fill = 1;
          field = 1;
          hold = (slotLocal - REVEAL_END) / (HOLD_END - REVEAL_END);
          pulse = 1;
          label = 1;
          morph = 0;
        } else {
          phase = "transition";
          fill = 1;
          field = 1;
          hold = 1;
          pulse = 1;
          label = 1;
          morph = (slotLocal - HOLD_END) / (1 - HOLD_END);
        }
      }
    }

    if (reduceMotion) {
      smoke = 0;
      identity = 0;
      intro = p > 0.02 ? 1 : 0;
      syncSmokePlayback(section, false, true);
      if (settled || p >= pin + (SMOKE_SHARE + METRICS_SHARE) * (1 - pin)) {
        phase = "overview";
        overview = 1;
        overviewState = "full";
        mode = "overview";
        fill = 1;
        field = 0.35;
        hold = 1;
        pulse = 1;
        label = 1;
        morph = 0;
        if (!settled) commitRevisitGeometry(section);
      } else if (p < pin) {
        phase = "intro";
        field = intro * 0.2;
      } else {
        const local = (p - pin) / Math.max(0.001, 1 - pin);
        const metricLocal = Math.max(0, local - SMOKE_SHARE);
        metricIndex = Math.min(
          METRIC_COUNT - 1,
          Math.floor(metricLocal / SLOT),
        );
        mode = PERFORMANCE_METRICS[metricIndex] as MatterMode;
        phase = "hold";
        fill = 1;
        field = 1;
        hold = 1;
        pulse = 1;
        label = 1;
        morph = 0;
      }
    }

    setVar("--perf-intro", intro.toFixed(4));
    setVar("--perf-smoke", smoke.toFixed(4));
    /* Veil strengthens as Smoke yields hierarchy to metrics/copy. */
    setVar(
      "--perf-smoke-veil",
      Math.max(0, Math.min(1, 1 - smoke * 0.72)).toFixed(4),
    );
    setVar("--perf-identity", identity.toFixed(4));
    setVar("--perf-fill", fill.toFixed(4));
    setVar("--perf-field", field.toFixed(4));
    setVar("--perf-hold", hold.toFixed(4));
    setVar("--perf-pulse", pulse.toFixed(4));
    setVar("--perf-label", label.toFixed(4));
    setVar("--perf-morph", morph.toFixed(4));
    setVar("--perf-overview", overview.toFixed(4));
    setVar("--perf-metric-index", String(metricIndex));
    setData("perfPhase", phase);
    setData("perfMetric", mode);
    setData(
      "perfVisit",
      section.dataset.perfGeom === "settled" ? "settled" : "discovering",
    );
    setData(
      "performanceState",
      isPerformanceSettled() || section.dataset.perfGeom === "settled"
        ? "settled"
        : "discovering",
    );
    setData("progress", p.toFixed(4));
    setData("pinProgress", pin.toFixed(4));
    if (overviewState === "idle") delete section.dataset.perfOverviewState;
    else setData("perfOverviewState", overviewState);
    if (overviewState === "full") section.dataset.perfOverviewSeen = "1";

    /* Sheet edge is the visual owner — never keep a full plate over it. */
    if (releaseFromLineaEdge() > 0.02) writeEdgeRelease();

    commitRevisitGeometry(section);

    for (let i = 0; i < METRIC_COUNT; i++) {
      const id = PERFORMANCE_METRICS[i];
      let vis = 0;
      if (phase === "smoke" || phase === "idle") {
        vis = 0;
      } else if (phase === "overview") {
        /*
         * Assemble: metric 06 gently yields while Overview plate rises.
         * Other exhibits stay hidden — Overview DOM carries the six modules.
         */
        if (i === METRIC_COUNT - 1 && overview < 0.42) {
          vis = Math.max(0, 1 - overview / 0.42);
        } else {
          vis = 0;
        }
      } else if (i === metricIndex && phase !== "intro") {
        vis = phase === "transition" ? 1 - morph * 0.85 : fill > 0 ? 1 : 0;
        if (phase === "reveal") vis = Math.min(1, fill * 1.2);
      } else if (
        i === metricIndex - 1 &&
        phase === "reveal" &&
        morph > 0
      ) {
        vis = morph * 0.35;
      }
      setVar(`--perf-vis-${id}`, vis.toFixed(4));
    }

    const key = `${phase}:${mode}:${field.toFixed(2)}:${morph.toFixed(2)}:${smoke.toFixed(2)}`;
    if (onField && key !== lastKey) {
      lastKey = key;
      onField({
        build: field,
        breathe: hold,
        mode,
        morph,
        metricIndex,
      });
    }
  };

  applyProgress(0, 0.12);

  const arch = document.querySelector<HTMLElement>(
    ".olfactory-architecture--atlas",
  );
  const splitChapter =
    section.closest(".perfume-document")?.getAttribute("data-chapter-layout") ===
    "split";

  const syncHandoff = (progress: number) => {
    /*
     * Visual mapping (approved): overlay + data-perf-approach at t>0.002
     * so atmosphere/panel dimming CSS applies for the whole overlap.
     * Stability: no velocity snap, no fastScrollEnd — t is scrub progress only.
     */
    const t = Math.max(0, Math.min(1, progress));
    section.style.setProperty("--perf-approach", t.toFixed(4));
    if (!arch) return;
    arch.style.setProperty("--arch-perf-handoff", t.toFixed(4));
    if (t > 0.002) arch.dataset.perfApproach = "true";
    else delete arch.dataset.perfApproach;
  };

  const clearHandoff = () => {
    section.style.setProperty("--perf-approach", "0");
    if (!arch) return;
    arch.style.setProperty("--arch-perf-handoff", "0");
    delete arch.dataset.perfApproach;
  };

  /** Short Architecture → Performance overlap — skipped in split prototype. */
  const handoffSt = splitChapter
    ? null
    : ScrollTrigger.create({
        id: "no23-arch-perf-handoff",
        trigger: section,
        start: "top bottom",
        end: "top 52%",
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => syncHandoff(self.progress),
        onLeave: () => syncHandoff(1),
        onLeaveBack: (self) => {
          syncHandoff(self.progress);
          commitRevisitGeometry(section);
        },
        onEnterBack: (self) => syncHandoff(self.progress),
      });

  const st = ScrollTrigger.create({
    id: "no23-performance-chapter",
    trigger: section,
    start: "top bottom",
    end: "bottom bottom",
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      const height = Math.max(1, section.offsetHeight);
      const pinP = Math.min(0.16, Math.max(0.08, window.innerHeight / height));
      const jumped = Math.abs(self.getVelocity()) > 2800;
      applyProgress(
        self.progress,
        pinP,
        isNavigating(self.getVelocity(), jumped),
      );
    },
    onRefresh: (self) => {
      const height = Math.max(1, section.offsetHeight);
      const pinP = Math.min(0.16, Math.max(0.08, window.innerHeight / height));
      applyProgress(self.progress, pinP, isPerformanceSettled());
    },
    onLeave: () => {
      markSettledFlags(section);
      commitRevisitGeometry(section);
    },
    onLeaveBack: () => {
      commitRevisitGeometry(section);
    },
  });

  /**
   * Settled pin ownership — sticky stage flush under header.
   */
  const syncPinned = () => {
    const stage = section.querySelector<HTMLElement>(
      ".performance-section__stage",
    );
    if (!stage || section.dataset.perfVisit !== "settled") {
      delete section.dataset.perfPinned;
      return;
    }
    const top = stage.getBoundingClientRect().top;
    if (top <= 2 && top >= -4) section.dataset.perfPinned = "true";
    else delete section.dataset.perfPinned;
  };

  const releaseSt = ScrollTrigger.create({
    id: "no23-performance-release",
    trigger: section,
    start: "top top",
    end: "bottom bottom",
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => {
      if (section.dataset.perfCollapsing === "1") {
        /* Keep current clip — zeroing release during collapse is the blue frame. */
        return;
      }
      if (section.dataset.perfVisit !== "settled") {
        /* First-discovery release is written by applyProgress. Do not zero it. */
        delete section.dataset.perfPinned;
        return;
      }
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        section.style.setProperty("--perf-release", "0");
        clearSheetRelease();
        syncPinned();
        return;
      }

      syncPinned();

      /*
       * Revisit bands inside existing 190vh (this trigger: top top →
       * bottom bottom ≈ 90vh / 810px at a 900px viewport). Geometry is
       * unchanged — only the visual map.
       *
       * ARRIVE  — before this trigger (section.top > 0): Architecture
       *           frames the Overview. --perf-release stays 0.
       * OWN     — progress 0..REVISIT_OWN (~0.22 ≈ 178px ≈ two normal
       *           ticks): Overview owns the viewport. Scroll still
       *           moves (sticky plate + late hold-cue). Not a freeze.
       * RELEASE — progress > REVISIT_OWN: clip from La Línea sheet top.
       *
       * 0.05 was shorter than one 80px tick, so the same gesture that
       * finished arrival opened La Línea. 0.42 was a dead freeze.
       */
      const REVISIT_OWN = 0.22;
      const DISCOVERY_OWN = 0.08;
      const HOLD =
        section.dataset.perfLife === "revisit" ||
        section.dataset.perfHold === "revisit"
          ? REVISIT_OWN
          : DISCOVERY_OWN;

      if (self.progress <= HOLD) {
        const edge = releaseFromLineaEdge();
        /* Sheet already in the viewport — edge owns. Do not slam shut. */
        if (edge > 0.02) {
          writeEdgeRelease();
          section.dataset.perfBand = "release";
          section.style.setProperty("--perf-hold-cue", "0");
          return;
        }
        writeRelease(0);
        section.dataset.perfOverviewState = "full";
        section.dataset.perfBand = "own";
        section.style.setProperty("--perf-release", "0");
        const holdT = HOLD > 0 ? self.progress / HOLD : 1;
        const cue = holdT > 0.55 ? (holdT - 0.55) / 0.45 : 0;
        section.style.setProperty("--perf-hold-cue", cue.toFixed(4));
        return;
      }

      section.style.setProperty("--perf-hold-cue", "0");
      delete section.dataset.perfOverviewState;
      section.dataset.perfBand = "release";
      writeEdgeRelease();
    },
    onLeaveBack: () => {
      delete section.dataset.perfDeparted;
      delete section.dataset.perfBand;
      writeEdgeRelease();
      section.style.setProperty("--perf-hold-cue", "0");
      syncPinned();
    },
    onLeave: () => {
      if (section.dataset.perfCollapsing === "1") return;
      section.dataset.perfDeparted = "true";
      /*
       * end: bottom bottom — the release runway is consumed.
       * Writing min(1, tTrack) left --perf-release stuck at ~0.84 after
       * onUpdate stopped, so the first reverse slid a leftover plate
       * over Criterio. Complete the clip; reverse re-enters via onUpdate.
       */
      writeRelease(1);
      section.style.setProperty("--perf-hold-cue", "0");
      delete section.dataset.perfPinned;
      if (sawReleaseMotion) {
        markPerformanceReleaseSeen();
        markPerformanceSettled();
        section.dataset.perfHold = "revisit";
      }
      markSettledFlags(section);
    },
  });

  const onAbort = () => {
    st.kill();
    releaseSt.kill();
    clearSheetRelease();
  };
  signal?.addEventListener("abort", onAbort, { once: true });
  ScrollTrigger.refresh();

  return () => {
    signal?.removeEventListener("abort", onAbort);
    handoffSt?.kill();
    clearHandoff();
    releaseSt.kill();
    st.kill();
    clearSheetRelease();
    syncSmokePlayback(section, false, true);
    delete section.dataset.perfPhase;
    delete section.dataset.perfMetric;
    delete section.dataset.perfVisit;
    delete section.dataset.perfGeom;
    delete section.dataset.perfSmoke;
    delete section.dataset.perfHold;
    delete section.dataset.perfPinned;
    delete section.dataset.perfDeparted;
    delete section.dataset.perfLife;
    delete section.dataset.perfOverviewSeen;
    delete section.dataset.perfOwn;
    delete section.dataset.performanceState;
    delete section.dataset.progress;
    delete section.dataset.pinProgress;
    [
      "--perf-intro",
      "--perf-approach",
      "--perf-smoke",
      "--perf-smoke-veil",
      "--perf-identity",
      "--perf-fill",
      "--perf-field",
      "--perf-hold",
      "--perf-pulse",
      "--perf-label",
      "--perf-morph",
      "--perf-overview",
      "--perf-release",
      "--perf-metric-index",
      ...PERFORMANCE_METRICS.map((id) => `--perf-vis-${id}`),
    ].forEach((prop) => section.style.removeProperty(prop));
  };
}
