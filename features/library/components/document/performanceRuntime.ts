"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  isNavigating,
  isPerformanceSettled,
  markPerformanceDiscovering,
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

/**
 * Collapse discovery runway → compact Overview section without a visual jump.
 * Call only after Overview owns the frame (or on leave past Performance).
 */
function collapseSettledGeometry(section: HTMLElement) {
  if (section.dataset.perfGeom === "settled") return;
  const absTop = section.getBoundingClientRect().top + window.scrollY;
  const oldH = section.offsetHeight;
  section.dataset.perfVisit = "settled";
  section.dataset.perfGeom = "settled";
  markPerformanceSettled();

  /* Kill discovery smoke — never replay on revisit. */
  section.dataset.perfSmoke = "done";
  section.dataset.performanceState = "settled";
  section.querySelectorAll<HTMLVideoElement>(
    ".performance-section__smoke-video",
  ).forEach((smokeVideo) => {
    try {
      smokeVideo.pause();
    } catch {
      /* ignore */
    }
  });

  void section.offsetHeight;
  ScrollTrigger.refresh();

  const newH = section.offsetHeight;
  if (newH >= oldH - 8) return;

  const target = Math.max(0, absTop);
  window.scrollTo({
    top: target,
    left: 0,
    behavior: "instant" as ScrollBehavior,
  });
  ScrollTrigger.update();
}

/**
 * Natural playback only — never scrub currentTime with scroll.
 * Soft-loop: when the clip restarts while still prominent, dip opacity
 * briefly so the seam is not a hard cut.
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

  videos.forEach((video) => {
    try {
      video.muted = true;
      video.loop = true;
      if (!video.dataset.smokeLoopBound) {
        video.dataset.smokeLoopBound = "1";
        const softSeam = () => {
          const smoke = Number.parseFloat(
            getComputedStyle(section).getPropertyValue("--perf-smoke") || "0",
          );
          /* Only veil the restart while Smoke is still a clear layer. */
          if (smoke < 0.28) return;
          section.classList.add("is-smoke-looping");
          window.setTimeout(() => {
            section.classList.remove("is-smoke-looping");
          }, 280);
        };
        video.addEventListener("seeked", () => {
          if (video.currentTime < 0.12) softSeam();
        });
      }
      const play = video.play();
      if (play && typeof play.catch === "function") play.catch(() => undefined);
    } catch {
      /* ignore */
    }
  });
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
  /* Post-pin local shares */
  const SMOKE_SHARE = 0.075; /* ~short cinematic opening, not a runway */
  /*
   * Assemble runway after metric 06 → settled Overview.
   * ~0.035 of post-pin ≈ 25–28vh at 1440×900 — enough to perceive
   * recomposition, short enough that navigation stays responsive.
   * Collapse geometry ONLY at the end (not on first overview frame).
   */
  const OVERVIEW_SHARE = 0.035;
  const METRICS_SHARE = 1 - SMOKE_SHARE - OVERVIEW_SHARE;
  const SLOT = METRICS_SHARE / METRIC_COUNT;
  const REVEAL_END = 0.22;
  const HOLD_END = 0.77;
  /** Defer 900vh→100vh collapse until assemble nearly complete. */
  const SETTLE_AT = 0.92;

  let lastKey = "";
  const lastVars: Record<string, string> = {};
  let collapsing = false;
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

  if (isPerformanceSettled()) {
    section.dataset.perfVisit = "settled";
    section.dataset.perfGeom = "settled";
    section.dataset.perfSmoke = "done";
    section.dataset.performanceState = "settled";
  } else {
    section.dataset.performanceState = "discovering";
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

    if (settled && p > 0.002) {
      phase = "overview";
      intro = 1;
      overview = 1;
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
    } else if (p <= 0.002) {
      phase = "idle";
      intro = 0;
      field = 0;
      smoke = 0;
      identity = 0;
      smokeStarted = false;
      syncSmokePlayback(section, false, reduceMotion);
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
    } else {
      intro = 1;
      const local = (p - pin) / Math.max(0.001, 1 - pin);

      if (local < SMOKE_SHARE) {
        phase = "smoke";
        const t = local / SMOKE_SHARE;
        /* Protagonist → hand off into metric 01 residue (stay alive). */
        smoke = t < 0.55 ? 1 : 1 - ((t - 0.55) / 0.45) * 0.36;
        identity = t < 0.2 ? t / 0.2 : t < 0.62 ? 1 : 1 - (t - 0.62) / 0.38;
        field = t < 0.45 ? t * 0.25 : 0.12 + ((t - 0.45) / 0.55) * 0.88;
        fill = t < 0.72 ? 0 : ((t - 0.72) / 0.28) * 0.35;
        morph = 0;
        mode = "longevity";
        metricIndex = 0;
        if (!smokeStarted) {
          smokeStarted = true;
          syncSmokePlayback(section, true, reduceMotion);
        }
        if (navigating) {
          smoke = Math.min(smoke, 0.4);
          field = Math.max(field, 0.55);
          identity = Math.min(identity, 0.4);
        }
      } else if (local >= SMOKE_SHARE + METRICS_SHARE) {
        /*
         * Assemble: 06 settles → metrics recompose into Overview plate.
         * Geometry stays at discovery height until SETTLE_AT so reverse
         * scroll can unassemble; then collapse to settled 100vh.
         */
        phase = "overview";
        const ovLocal = local - SMOKE_SHARE - METRICS_SHARE;
        overview = Math.min(1, ovLocal / OVERVIEW_SHARE);
        identity = 0;
        metricIndex = METRIC_COUNT - 1;
        mode = "overview";
        morph = 0;

        if (navigating) {
          /* Fast scroll: compress assemble, keep dark coverage, settle. */
          overview = 1;
          smoke = 0;
          fill = 1;
          field = 0.35;
          hold = 1;
          pulse = 0.35;
          label = 1;
          syncSmokePlayback(section, false, reduceMotion);
          if (!settled && !collapsing) {
            collapsing = true;
            requestAnimationFrame(() => {
              collapseSettledGeometry(section);
              collapsing = false;
            });
          }
        } else {
          /* A RESOLVE (0–0.22): 06 holds, motion settles, field begins calm */
          /* B ASSEMBLE (0.22–0.85): plate opens, metrics return, smoke yields */
          /* C LOCK (0.85–1): Overview owns the frame → geometry collapse */
          const resolveT = Math.min(1, overview / 0.22);
          const assembleT = Math.max(
            0,
            Math.min(1, (overview - 0.22) / 0.63),
          );

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

          /* Tiny settle emphasis on final metric as resolve completes */
          void resolveT;

          if (!settled && !collapsing && overview >= SETTLE_AT) {
            collapsing = true;
            requestAnimationFrame(() => {
              collapseSettledGeometry(section);
              collapsing = false;
            });
          }
        }
      } else {
        /* Metrics 01–06 — Smoke stays alive as atmospheric texture. */
        identity = 0;
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
        mode = "overview";
        fill = 1;
        field = 0.35;
        hold = 1;
        pulse = 1;
        label = 1;
        morph = 0;
        if (!settled) collapseSettledGeometry(section);
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
    setData("perfVisit", isPerformanceSettled() ? "settled" : "discovering");
    setData(
      "performanceState",
      isPerformanceSettled() ? "settled" : "discovering",
    );
    setData("progress", p.toFixed(4));
    setData("pinProgress", pin.toFixed(4));

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

  const syncHandoff = (progress: number, velocity: number) => {
    /* Fling only — scrub owns slow/moderate scroll through the overlap. */
    const fling = Math.abs(velocity) >= NAV_VELOCITY;
    const t =
      fling && progress > 0.08
        ? 1
        : Math.max(0, Math.min(1, progress));
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

  /** Short Architecture → Performance overlap (~fraction of one viewport). */
  const handoffSt = ScrollTrigger.create({
    id: "no23-arch-perf-handoff",
    trigger: section,
    start: "top bottom",
    end: "top 52%",
    scrub: true,
    fastScrollEnd: true,
    invalidateOnRefresh: true,
    onUpdate: (self) => syncHandoff(self.progress, self.getVelocity()),
    onLeave: () => syncHandoff(1, 0),
    onLeaveBack: clearHandoff,
    onEnterBack: (self) => syncHandoff(self.progress, self.getVelocity()),
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
    onLeave: (self) => {
      if (self.progress > 0.5) {
        markPerformanceSettled();
        if (section.dataset.perfGeom !== "settled") {
          collapseSettledGeometry(section);
        }
      }
    },
  });

  const onAbort = () => st.kill();
  signal?.addEventListener("abort", onAbort, { once: true });
  ScrollTrigger.refresh();

  return () => {
    signal?.removeEventListener("abort", onAbort);
    handoffSt.kill();
    clearHandoff();
    st.kill();
    syncSmokePlayback(section, false, true);
    delete section.dataset.perfPhase;
    delete section.dataset.perfMetric;
    delete section.dataset.perfVisit;
    delete section.dataset.perfGeom;
    delete section.dataset.perfSmoke;
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
      "--perf-metric-index",
      ...PERFORMANCE_METRICS.map((id) => `--perf-vis-${id}`),
    ].forEach((prop) => section.style.removeProperty(prop));
  };
}
