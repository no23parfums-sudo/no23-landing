import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  isNavigating,
  isSmokeVisited,
  markSmokePlayed,
  markSmokeVisited,
} from "../../lib/discoveryState";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Dedicated ST — Architecture → Smoke → Performance handoff */
export const ARCH_CINEMATIC_ST_ID = "no23-arch-cinematic";

type SetupArgs = {
  root: HTMLElement;
  video: HTMLVideoElement;
  bridgeTime: number;
  reduceMotion: boolean;
  signal: AbortSignal;
};

async function prepareBridgeFrame(
  video: HTMLVideoElement,
  bridgeTime: number,
  signal: AbortSignal,
): Promise<void> {
  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.setAttribute("playsinline", "");
  video.setAttribute("muted", "");

  if (video.readyState < 2) {
    await new Promise<void>((resolve, reject) => {
      const onReady = () => {
        cleanup();
        resolve();
      };
      const onErr = () => {
        cleanup();
        reject(new Error("video load failed"));
      };
      const onAbort = () => {
        cleanup();
        reject(new DOMException("aborted", "AbortError"));
      };
      const cleanup = () => {
        video.removeEventListener("loadeddata", onReady);
        video.removeEventListener("canplay", onReady);
        video.removeEventListener("error", onErr);
        signal.removeEventListener("abort", onAbort);
      };
      video.addEventListener("loadeddata", onReady);
      video.addEventListener("canplay", onReady);
      video.addEventListener("error", onErr);
      signal.addEventListener("abort", onAbort, { once: true });
      try {
        video.load();
      } catch {
        /* ignore */
      }
    });
  }
  if (signal.aborted) throw new DOMException("aborted", "AbortError");

  const target = Math.min(
    bridgeTime,
    Math.max(0, (video.duration || bridgeTime) - 0.05),
  );

  await new Promise<void>((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      video.removeEventListener("seeked", finish);
      resolve();
    };
    video.addEventListener("seeked", finish);
    try {
      video.pause();
      video.currentTime = target;
    } catch {
      finish();
    }
    window.setTimeout(finish, 1800);
  });

  video.pause();
}

/**
 * Architecture → Smoke Film → Performance.
 *
 * Visual narrative (approved):
 * FOCUS → ISOLATION → SMOKE → CINEMA → ATMOSPHERE→INFORMATION
 *
 * Compositing rules (fast-scroll safe):
 * - Root shell never uses translucent autoAlpha while owned.
 * - Dark underlay reaches opacity 1 BEFORE Architecture opacity drops.
 * - Runway is dark in CSS — cream cannot show through Architecture exit.
 * - Portal stays owned until Performance sticky covers the viewport.
 */
export async function setupArchitectureCinematicRuntime({
  root,
  video,
  bridgeTime,
  reduceMotion,
  signal,
}: SetupArgs): Promise<() => void> {
  ScrollTrigger.getById(ARCH_CINEMATIC_ST_ID)?.kill();

  const film = root.querySelector<HTMLElement>(".arch-cinematic__film");
  const veil = root.querySelector<HTMLElement>(".arch-cinematic__veil");
  const shade = root.querySelector<HTMLElement>(".arch-cinematic__shade");
  const underlay = root.querySelector<HTMLElement>(".arch-cinematic__underlay");
  const runway = document.querySelector<HTMLElement>(".arch-cinematic-run");
  const architecture = document.querySelector<HTMLElement>(
    ".olfactory-architecture--atlas",
  );
  const performance = document.querySelector<HTMLElement>(
    ".performance-section",
  );

  if (!film || !veil || !runway) {
    return () => undefined;
  }

  const setReady = (ready: boolean) => {
    root.dataset.ready = ready ? "true" : "false";
  };

  /** Binary ownership — CSS visibility, never translucent root opacity. */
  const setStageOwnership = (owns: boolean) => {
    root.dataset.active = owns ? "true" : "false";
    if (owns) {
      gsap.set(root, { clearProps: "opacity,visibility" });
    } else {
      delete root.dataset.covered;
    }
  };

  /** Immediate opaque plate — not scrubbed. */
  const coverNow = () => {
    root.dataset.covered = "true";
    if (underlay) gsap.set(underlay, { opacity: 1 });
  };

  const applyStableSmoke = () => {
    setStageOwnership(true);
    coverNow();
    if (architecture) gsap.set(architecture, { opacity: 0 });
    gsap.set(film, { opacity: 1, scale: 1.012, filter: "brightness(1)" });
    gsap.set(veil, { opacity: 0 });
    if (shade) gsap.set(shade, { opacity: 0 });
    root.dataset.phase = "cinema";
    root.dataset.smokeVisit = "visited";
    resumeNatural();
  };

  const applyCoveredExit = () => {
    setStageOwnership(true);
    coverNow();
    if (shade) gsap.set(shade, { opacity: 1 });
    gsap.set(film, { opacity: 0, scale: 1.02, filter: "brightness(0.45)" });
    gsap.set(veil, { opacity: 0 });
    root.dataset.phase = "performance";
  };

  const performanceCovers = () => {
    if (!performance) return true;
    return performance.getBoundingClientRect().top <= 1;
  };

  const releasePortal = () => {
    setStageOwnership(false);
    delete root.dataset.covered;
    if (underlay) gsap.set(underlay, { opacity: 0 });
    gsap.set(film, { opacity: 0, scale: 1, filter: "brightness(1)" });
    gsap.set(veil, { opacity: 0 });
    if (shade) gsap.set(shade, { opacity: 0 });
    root.dataset.phase = "released";
  };

  /**
   * Hold opaque portal until Performance owns pixels.
   * Prevents hero/cream bleed when fast-scroll overshoots ST end.
   */
  const releaseWhenSafe = () => {
    if (performanceCovers()) {
      releasePortal();
      return;
    }
    setStageOwnership(true);
    coverNow();
    if (shade) gsap.set(shade, { opacity: 1 });
    requestAnimationFrame(() => {
      if (signal.aborted) return;
      if (performanceCovers()) releasePortal();
      else releaseWhenSafe();
    });
  };

  /** Force release if Performance already owns the viewport. */
  const ensurePerformanceOwns = () => {
    if (performanceCovers()) releasePortal();
  };

  const resetVisual = () => {
    setStageOwnership(false);
    delete root.dataset.covered;
    if (underlay) gsap.set(underlay, { opacity: 0 });
    gsap.set(film, { opacity: 0, scale: 1, filter: "brightness(1)" });
    gsap.set(veil, { opacity: 0 });
    if (shade) gsap.set(shade, { opacity: 0 });
    if (architecture) gsap.set(architecture, { clearProps: "opacity" });
    root.dataset.phase = "idle";
  };

  /** Playback modes: parked bridge → natural from 0 → hold end */
  let mode: "bridge" | "natural" | "ended" = "bridge";

  const parkBridge = () => {
    if (mode !== "bridge") return;
    try {
      if (Math.abs(video.currentTime - bridgeTime) > 0.1) {
        video.currentTime = bridgeTime;
      }
      if (!video.paused) video.pause();
    } catch {
      /* ignore */
    }
  };

  const startNaturalFromZero = () => {
    if (mode === "natural" || mode === "ended") return;
    mode = "natural";
    try {
      video.muted = true;
      video.currentTime = 0;
      const result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(() => {
          mode = "bridge";
        });
      }
    } catch {
      mode = "bridge";
    }
  };

  const resumeNatural = () => {
    const playMuted = () => {
      mode = "natural";
      try {
        video.muted = true;
        const result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(() => {
            mode = "bridge";
          });
        }
      } catch {
        mode = "bridge";
      }
    };

    /* Restart from 0 when the clip already finished — seek before play. */
    const nearEnd =
      video.ended ||
      (Number.isFinite(video.duration) &&
        video.duration > 0 &&
        video.currentTime >= video.duration - 0.2);

    if (mode === "ended" || nearEnd) {
      mode = "bridge";
      const onSeeked = () => {
        video.removeEventListener("seeked", onSeeked);
        playMuted();
      };
      video.addEventListener("seeked", onSeeked);
      try {
        video.currentTime = 0;
      } catch {
        video.removeEventListener("seeked", onSeeked);
        playMuted();
      }
      return;
    }

    if (mode === "natural") {
      if (video.paused) playMuted();
      return;
    }
    playMuted();
  };

  const stopPlayback = (seekBridge: boolean) => {
    mode = "bridge";
    try {
      video.pause();
      if (seekBridge) video.currentTime = bridgeTime;
    } catch {
      /* ignore */
    }
  };

  const onVideoEnded = () => {
    mode = "ended";
    try {
      if (video.duration && Number.isFinite(video.duration)) {
        video.currentTime = Math.max(0, video.duration - 0.04);
      }
      video.pause();
    } catch {
      /* ignore */
    }
  };

  setReady(false);
  resetVisual();

  if (reduceMotion) {
    setReady(true);
    root.dataset.phase = "reduced";
    setStageOwnership(false);
    return () => {
      resetVisual();
      setReady(false);
      ScrollTrigger.getById(ARCH_CINEMATIC_ST_ID)?.kill();
    };
  }

  try {
    await prepareBridgeFrame(video, bridgeTime, signal);
  } catch {
    if (signal.aborted) return () => undefined;
    try {
      video.currentTime = bridgeTime;
      video.pause();
    } catch {
      /* ignore */
    }
  }
  if (signal.aborted) return () => undefined;

  video.addEventListener("ended", onVideoEnded);
  setReady(true);
  resetVisual();

  const syncVisitGeometry = () => {
    const visited = isSmokeVisited();
    runway.dataset.visit = visited ? "visited" : "unseen";
    if (visited) document.documentElement.dataset.smokeVisit = "visited";
    else delete document.documentElement.dataset.smokeVisit;
  };

  /**
   * Collapse first-pass runway → revisit height without a scroll jump.
   * When shrinking a section above the viewport, compensate scrollY by Δh.
   */
  const collapseSmokeGeometryIfNeeded = (direction: "down" | "up") => {
    if (runway.dataset.visit === "visited") {
      syncVisitGeometry();
      return;
    }
    const oldH = runway.offsetHeight;
    markSmokeVisited();
    syncVisitGeometry();
    void runway.offsetHeight;
    const newH = runway.offsetHeight;
    const delta = oldH - newH;
    requestAnimationFrame(() => {
      if (signal.aborted) return;
      ScrollTrigger.refresh();
      if (delta > 8 && direction === "down") {
        window.scrollTo({
          top: Math.max(0, window.scrollY - delta),
          left: 0,
          behavior: "instant" as ScrollBehavior,
        });
        ScrollTrigger.update();
      }
    });
  };

  syncVisitGeometry();

  const syncPhase = (progress: number, isActive: boolean) => {
    let phase = "idle";
    if (!isActive && progress >= 1) phase = "released";
    else if (!isActive && progress <= 0) phase = "idle";
    else if (progress >= 0.78) phase = "performance";
    else if (progress >= 0.38) phase = "cinema";
    else if (progress >= 0.22) phase = "swap";
    else if (progress >= 0.06) phase = "focus";
    if (root.dataset.phase !== phase) root.dataset.phase = phase;
    root.dataset.progress = progress.toFixed(4);
  };

  let lastScrubProgress = 0;
  let naturalStarted = false;

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: "none" } });

    /*
     * SHORT bridge — scroll owns composition only; video plays by time.
     * 0.00–0.08  cover arrives
     * 0.06–0.22  Architecture exits under opaque dark
     * 0.18–0.32  Film present under veil → unveil
     * 0.32–0.72  Cinema observation (video time-driven)
     * 0.68–1.00  Shade into Performance / release cover
     */
    if (underlay) {
      tl.fromTo(underlay, { opacity: 0 }, { opacity: 1, duration: 0.05 }, 0.04);
    }
    tl.fromTo(veil, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.05);

    if (architecture) {
      tl.fromTo(
        architecture,
        { opacity: 1 },
        { opacity: 0, duration: 0.14 },
        0.08,
      );
    }

    tl.fromTo(
      film,
      { opacity: 0, scale: 1, filter: "brightness(1)" },
      { opacity: 1, scale: 1.008, filter: "brightness(1)", duration: 0.1 },
      0.18,
    );
    tl.to(veil, { opacity: 0, duration: 0.1 }, 0.28);
    tl.to(film, { scale: 1.012, duration: 0.08 }, 0.32);

    if (shade) {
      tl.fromTo(shade, { opacity: 0 }, { opacity: 1, duration: 0.22 }, 0.68);
    }
    tl.to(
      film,
      {
        opacity: 0.05,
        scale: 1.03,
        filter: "brightness(0.5)",
        duration: 0.24,
      },
      0.7,
    );
    tl.to(film, { opacity: 0, duration: 0.06 }, 0.94);
    if (shade) {
      tl.to(shade, { opacity: 1, duration: 0.01 }, 0.94);
    }

    ScrollTrigger.create({
      id: ARCH_CINEMATIC_ST_ID,
      animation: tl,
      trigger: runway,
      start: "top bottom",
      endTrigger: performance ?? runway,
      end: performance ? "top+=24 top" : "bottom bottom",
      scrub: true,
      invalidateOnRefresh: true,
      fastScrollEnd: true,
      onUpdate: (self) => {
        /* Performance sticky owns pixels → portal must be inert. */
        if (performanceCovers()) {
          ensurePerformanceOwns();
          lastScrubProgress = self.progress;
          return;
        }

        const active = self.isActive;
        const jumped = Math.abs(self.progress - lastScrubProgress) > 0.1;
        lastScrubProgress = self.progress;
        const navigating = isNavigating(self.getVelocity(), jumped);
        const visited = isSmokeVisited();

        if (active) {
          setStageOwnership(true);
          if (self.progress >= 0.04 || navigating || visited) coverNow();
        } else if (self.progress >= 1) {
          setStageOwnership(true);
          coverNow();
          releaseWhenSafe();
          return;
        } else if (self.progress <= 0) {
          setStageOwnership(false);
        }

        if (self.progress >= 0.32) markSmokePlayed();

        if (visited && active) {
          if (self.progress < 0.72) applyStableSmoke();
          else applyCoveredExit();
          root.dataset.progress = self.progress.toFixed(4);
          return;
        }

        if (navigating && active && self.progress >= 0.1) {
          coverNow();
          if (architecture) gsap.set(architecture, { opacity: 0 });
          if (self.progress < 0.72) {
            gsap.set(film, { opacity: 1 });
            gsap.set(veil, { opacity: 0 });
            resumeNatural();
          } else {
            applyCoveredExit();
          }
        }

        syncPhase(self.progress, root.dataset.active === "true");

        if (!active) {
          if (self.progress >= 1) stopPlayback(false);
          return;
        }

        /* Time-driven video once composition owns the frame — not scrubbed. */
        if (self.progress < 0.28) {
          if (mode === "natural" || mode === "ended") {
            if (!naturalStarted) stopPlayback(true);
          } else parkBridge();
        } else if (self.progress < 0.92) {
          if (!naturalStarted) {
            naturalStarted = true;
            startNaturalFromZero();
          } else {
            resumeNatural();
          }
        }
      },
      onRefresh: (self) => {
        syncVisitGeometry();
        if (self.isActive) {
          setStageOwnership(true);
          if (isSmokeVisited()) {
            if (self.progress < 0.72) applyStableSmoke();
            else applyCoveredExit();
            return;
          }
          if (self.progress >= 0.04) coverNow();
        } else if (self.progress >= 1 && !performanceCovers()) {
          setStageOwnership(true);
          coverNow();
        } else if (!self.isActive && self.progress <= 0) {
          stopPlayback(true);
          naturalStarted = false;
          resetVisual();
        }
        syncPhase(self.progress, root.dataset.active === "true");
      },
      onLeave: () => {
        stopPlayback(false);
        naturalStarted = false;
        collapseSmokeGeometryIfNeeded("down");
        releaseWhenSafe();
      },
      onLeaveBack: () => {
        stopPlayback(true);
        naturalStarted = false;
        collapseSmokeGeometryIfNeeded("up");
        if (architecture) gsap.set(architecture, { opacity: 1 });
        coverNow();
        requestAnimationFrame(() => {
          if (signal.aborted) return;
          tl.progress(0);
          resetVisual();
          if (architecture) gsap.set(architecture, { clearProps: "opacity" });
          syncPhase(0, false);
          ScrollTrigger.refresh();
        });
      },
      onEnter: (self) => {
        setStageOwnership(true);
        if (isSmokeVisited()) {
          applyStableSmoke();
          return;
        }
        if (self.progress >= 0.04 || isNavigating(self.getVelocity(), false)) {
          coverNow();
        }
        syncPhase(self.progress, true);
      },
      onEnterBack: (self) => {
        setStageOwnership(true);
        if (isSmokeVisited()) {
          if (self.progress < 0.72) applyStableSmoke();
          else applyCoveredExit();
          return;
        }
        if (self.progress >= 0.04) coverNow();
        const st = ScrollTrigger.getById(ARCH_CINEMATIC_ST_ID);
        if (st) tl.progress(st.progress);
      },
    });
  }, root);

  ScrollTrigger.refresh();
  requestAnimationFrame(() => {
    if (!signal.aborted) ScrollTrigger.refresh();
  });

  if (process.env.NODE_ENV !== "production") {
    (
      window as unknown as {
        __NO23_ARCH_CINE__?: {
          id: string;
          active: () => boolean;
          count: () => number;
          entry: number;
          mode: () => string;
          start: () => number | null;
          end: () => number | null;
          progress: () => number | null;
          scrollToProgress: (p: number) => boolean;
        };
      }
    ).__NO23_ARCH_CINE__ = {
      id: ARCH_CINEMATIC_ST_ID,
      active: () => Boolean(ScrollTrigger.getById(ARCH_CINEMATIC_ST_ID)),
      count: () =>
        ScrollTrigger.getAll().filter((t) => t.vars.id === ARCH_CINEMATIC_ST_ID)
          .length,
      entry: bridgeTime,
      mode: () => mode,
      start: () => ScrollTrigger.getById(ARCH_CINEMATIC_ST_ID)?.start ?? null,
      end: () => ScrollTrigger.getById(ARCH_CINEMATIC_ST_ID)?.end ?? null,
      progress: () =>
        ScrollTrigger.getById(ARCH_CINEMATIC_ST_ID)?.progress ?? null,
      scrollToProgress: (p: number) => {
        const st = ScrollTrigger.getById(ARCH_CINEMATIC_ST_ID);
        if (!st) return false;
        const t = Math.min(1, Math.max(0, p));
        const y = st.start + (st.end - st.start) * t;
        window.scrollTo({ top: y, left: 0, behavior: "instant" as ScrollBehavior });
        ScrollTrigger.update();
        return true;
      },
    };
  }

  return () => {
    video.removeEventListener("ended", onVideoEnded);
    stopPlayback(false);
    ScrollTrigger.getById(ARCH_CINEMATIC_ST_ID)?.kill();
    ctx.revert();
    resetVisual();
    setReady(false);
    if (process.env.NODE_ENV !== "production") {
      const w = window as unknown as { __NO23_ARCH_CINE__?: unknown };
      delete w.__NO23_ARCH_CINE__;
    }
  };
}
