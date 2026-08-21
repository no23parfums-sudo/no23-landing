import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Single instance id — Strict Mode / remount always kills this first */
export const S2S3_ST_ID = "no23-s2s3-handoff";

type SetupArgs = {
  section: HTMLElement;
  reduceMotion: boolean;
  signal: AbortSignal;
};

function readDocRise(shell: HTMLElement | null): number {
  if (!shell) return 0;
  return parseFloat(shell.style.getPropertyValue("--hero-doc-rise") || "0") || 0;
}

/** Document transform is visually neutral — safe for ST geometry measurement */
function isDocumentGeometryStable(shell: HTMLElement | null): boolean {
  if (!shell) return true;
  const rise = readDocRise(shell);
  if (rise >= 0.99) return true;
  return shell.dataset.heroPhase === "document" && rise >= 0.95;
}

function waitForAbortable(
  signal: AbortSignal,
  predicate: () => boolean,
  watch: (onMaybe: () => void) => () => void,
): Promise<void> {
  if (signal.aborted) {
    return Promise.reject(new DOMException("aborted", "AbortError"));
  }
  if (predicate()) return Promise.resolve();

  return new Promise((resolve, reject) => {
    let done = false;
    const finish = (fn: () => void) => {
      if (done) return;
      done = true;
      cleanup();
      fn();
    };
    const onAbort = () =>
      finish(() => reject(new DOMException("aborted", "AbortError")));
    const onMaybe = () => {
      if (!predicate()) return;
      finish(() => resolve());
    };
    const unwatch = watch(onMaybe);
    const cleanup = () => {
      signal.removeEventListener("abort", onAbort);
      unwatch();
    };
    signal.addEventListener("abort", onAbort, { once: true });
    onMaybe();
  });
}

async function waitUntilReady(
  section: HTMLElement,
  signal: AbortSignal,
): Promise<HTMLElement> {
  await waitForAbortable(
    signal,
    () => Boolean(document.querySelector(".fragrance-notes")),
    (onMaybe) => {
      const obs = new MutationObserver(onMaybe);
      obs.observe(document.body, { childList: true, subtree: true });
      return () => obs.disconnect();
    },
  );

  const notes = document.querySelector(".fragrance-notes") as HTMLElement;

  if (document.fonts?.ready) {
    await Promise.race([
      document.fonts.ready,
      new Promise<void>((r) => {
        const t = window.setTimeout(r, 1200);
        signal.addEventListener(
          "abort",
          () => window.clearTimeout(t),
          { once: true },
        );
      }),
    ]);
  }
  if (signal.aborted) throw new DOMException("aborted", "AbortError");

  const imgs = [
    ...Array.from(notes.querySelectorAll("img")),
    ...Array.from(section.querySelectorAll("img")),
  ] as HTMLImageElement[];
  await Promise.all(
    imgs.map((img) => {
      if (img.complete) return Promise.resolve();
      if (typeof img.decode === "function") {
        return img.decode().catch(() => undefined);
      }
      return new Promise<void>((resolve) => {
        img.addEventListener("load", () => resolve(), { once: true });
        img.addEventListener("error", () => resolve(), { once: true });
      });
    }),
  );
  if (signal.aborted) throw new DOMException("aborted", "AbortError");

  const shell = document.querySelector<HTMLElement>("[data-perfume-shell]");

  await waitForAbortable(
    signal,
    () => isDocumentGeometryStable(shell),
    (onMaybe) => {
      if (!shell) {
        const id = window.setInterval(onMaybe, 50);
        return () => window.clearInterval(id);
      }
      const mo = new MutationObserver(onMaybe);
      mo.observe(shell, {
        attributes: true,
        attributeFilter: ["data-hero-phase", "style"],
      });
      window.addEventListener("scroll", onMaybe, { passive: true });
      return () => {
        mo.disconnect();
        window.removeEventListener("scroll", onMaybe);
      };
    },
  );

  await new Promise<void>((r) =>
    requestAnimationFrame(() => requestAnimationFrame(() => r())),
  );
  if (signal.aborted) throw new DOMException("aborted", "AbortError");

  return notes;
}

function syncDiscreteAttrs(
  section: HTMLElement,
  notes: HTMLElement | null,
  progress: number,
) {
  const settled = progress >= 0.995;
  const handoff = settled ? "settled" : "active";
  if (section.getAttribute("data-handoff") !== handoff) {
    section.setAttribute("data-handoff", handoff);
  }
  section.dataset.progress = progress.toFixed(4);
  /* Signature Notes stays a solid page — no scene-exit / void masks. */
  if (notes?.hasAttribute("data-scene-exit")) {
    notes.removeAttribute("data-scene-exit");
  }
}

/**
 * Still-life lift window: first Architecture contact → ~340px.
 * ~38% of a 900px viewport. Not a page-blend runway.
 */
const S3_LIFT_TRAVEL_PX = 330;

function measureHandoffWindow(section: HTMLElement): { start: number; end: number } {
  const vh = window.innerHeight;
  const y = window.scrollY;
  const top = section.getBoundingClientRect().top;
  return {
    start: y + top - vh,
    end: y + top - vh + S3_LIFT_TRAVEL_PX,
  };
}

const S2_REST_VARS: Record<string, string> = {
  "--s2-feather": "0px",
  "--s2-void": "0",
  "--s2-opacity": "1",
  "--s2-support": "1",
  "--s2-copy": "1",
  "--s2-media": "1",
  "--s2-names": "1",
  "--s2-halo": "1",
  "--s2-x-top": "0px",
  "--s2-x-heart": "0px",
  "--s2-x-base": "0px",
  "--s2-y": "0px",
  "--s2-photo-y-top": "0px",
  "--s2-photo-y-heart": "0px",
  "--s2-photo-y-base": "0px",
};

const S3_REST_ACTIVE: Record<string, string> = {
  "--s3-scene": "1",
  "--s3-still": "1",
  "--s3-anno": "1",
  "--s3-panel": "1",
  "--s3-panel-y": "0px",
  "--s3-lift": "0",
};

function applyVars(el: HTMLElement, vars: Record<string, string>) {
  for (const [k, v] of Object.entries(vars)) {
    el.style.setProperty(k, v);
  }
}

function clearS2Vars(notes: HTMLElement) {
  for (const k of Object.keys(S2_REST_VARS)) {
    notes.style.removeProperty(k);
  }
  notes.style.removeProperty("--s2-photo-y");
  notes.removeAttribute("data-scene-exit");
}

function clearS3Vars(section: HTMLElement) {
  section.style.removeProperty("--s3-scene");
  section.style.removeProperty("--s3-still");
  section.style.removeProperty("--s3-anno");
  section.style.removeProperty("--s3-panel");
  section.style.removeProperty("--s3-panel-y");
  section.style.removeProperty("--s3-lift");
  delete section.dataset.progress;
  section.removeAttribute("data-handoff");
}

/**
 * One scrubbed S2→S3 master timeline + one ScrollTrigger.
 *
 * Depth release → olfactive scene takes ownership.
 * Timeline duration = 1 → progress maps 1:1 to phase percentages.
 */
export async function setupS2S3HandoffRuntime({
  section,
  reduceMotion,
  signal,
}: SetupArgs): Promise<() => void> {
  ScrollTrigger.getById(S2S3_ST_ID)?.kill();

  section.setAttribute("data-handoff", "active");
  section.dataset.progress = "0";
  applyVars(section, S3_REST_ACTIVE);

  const settleStatic = (notes: HTMLElement | null) => {
    section.setAttribute("data-handoff", "settled");
    section.dataset.progress = "1";
    section.style.setProperty("--s3-scene", "1");
    section.style.setProperty("--s3-still", "1");
    section.style.setProperty("--s3-anno", "1");
    section.style.setProperty("--s3-panel", "1");
    section.style.setProperty("--s3-panel-y", "0px");
    section.style.setProperty("--s3-lift", "1");
    if (notes) {
      clearS2Vars(notes);
    }
  };

  if (reduceMotion) {
    const notes = document.querySelector(
      ".fragrance-notes",
    ) as HTMLElement | null;
    settleStatic(notes);
    return () => {
      clearS3Vars(section);
    };
  }

  let notes: HTMLElement;
  try {
    notes = await waitUntilReady(section, signal);
  } catch {
    return () => {
      clearS3Vars(section);
    };
  }
  if (signal.aborted) {
    return () => {
      clearS3Vars(section);
    };
  }

  const clearProps = () => {
    clearS2Vars(notes);
    clearS3Vars(section);
  };

  /* Pages stay solid. Only the still-life object lifts. */
  section.setAttribute("data-handoff", "active");
  applyVars(section, S3_REST_ACTIVE);
  section.dataset.progress = "0";
  clearS2Vars(notes);

  let windowCache = measureHandoffWindow(section);

  const ctx = gsap.context(() => {
    const tl = gsap.timeline({ defaults: { ease: "none" } });
    tl.fromTo(
      section,
      { "--s3-lift": 0 },
      { "--s3-lift": 1, duration: 1 },
      0,
    );

    ScrollTrigger.create({
      id: S2S3_ST_ID,
      animation: tl,
      start: () => windowCache.start,
      end: () => windowCache.end,
      scrub: 0.18,
      invalidateOnRefresh: true,
      fastScrollEnd: false,
      onRefreshInit: () => {
        windowCache = measureHandoffWindow(section);
      },
      onUpdate: (self) => {
        syncDiscreteAttrs(section, notes, self.progress);
      },
      onRefresh: (self) => {
        syncDiscreteAttrs(section, notes, self.progress);
      },
      onLeave: () => {
        tl.progress(1);
        syncDiscreteAttrs(section, notes, 1);
        section.style.setProperty("--s3-lift", "1");
      },
      onLeaveBack: () => {
        tl.progress(0);
        syncDiscreteAttrs(section, notes, 0);
        applyVars(section, S3_REST_ACTIVE);
      },
    });
  }, section);

  const shell = document.querySelector<HTMLElement>("[data-perfume-shell]");
  let lastRise = readDocRise(shell);
  let lastPhase = shell?.dataset.heroPhase ?? "";

  const refreshIfGeometryChanged = () => {
    if (signal.aborted) return;
    const rise = readDocRise(shell);
    const phase = shell?.dataset.heroPhase ?? "";
    const becameStable = lastRise < 0.95 && rise >= 0.95;
    const stableDrift = rise >= 0.95 && Math.abs(rise - lastRise) > 0.02;
    const phaseToDocument =
      lastPhase !== "document" &&
      phase === "document" &&
      rise >= 0.95;
    lastRise = rise;
    lastPhase = phase;
    if (becameStable || stableDrift || phaseToDocument) {
      ScrollTrigger.refresh();
    }
  };

  const mo = shell
    ? new MutationObserver(refreshIfGeometryChanged)
    : null;
  mo?.observe(shell!, {
    attributes: true,
    attributeFilter: ["data-hero-phase", "style"],
  });

  const onResize = () => {
    if (isDocumentGeometryStable(shell)) ScrollTrigger.refresh();
  };
  window.addEventListener("resize", onResize, { passive: true });

  ScrollTrigger.refresh();

  const st = ScrollTrigger.getById(S2S3_ST_ID);
  if (st) syncDiscreteAttrs(section, notes, st.progress);

  if (process.env.NODE_ENV !== "production") {
    (
      window as unknown as {
        __NO23_S2S3__?: {
          id: string;
          active: () => boolean;
          count: () => number;
          window: () => { start: number; end: number; travelPx: number; travelVh: number };
        };
      }
    ).__NO23_S2S3__ = {
      id: S2S3_ST_ID,
      active: () => Boolean(ScrollTrigger.getById(S2S3_ST_ID)),
      count: () =>
        ScrollTrigger.getAll().filter((t) => t.vars.id === S2S3_ST_ID).length,
      window: () => {
        const travelPx = windowCache.end - windowCache.start;
        return {
          start: windowCache.start,
          end: windowCache.end,
          travelPx,
          travelVh: travelPx / window.innerHeight,
        };
      },
    };
  }

  let riseBump: (() => void) | undefined;
  if (shell && readDocRise(shell) < 0.99) {
    riseBump = () => {
      if (readDocRise(shell) >= 0.99) {
        ScrollTrigger.refresh();
        if (riseBump) window.removeEventListener("scroll", riseBump);
      }
    };
    window.addEventListener("scroll", riseBump, { passive: true });
  }

  return () => {
    mo?.disconnect();
    window.removeEventListener("resize", onResize);
    if (riseBump) window.removeEventListener("scroll", riseBump);
    ScrollTrigger.getById(S2S3_ST_ID)?.kill();
    ctx.revert();
    clearProps();
    if (process.env.NODE_ENV !== "production") {
      const w = window as unknown as { __NO23_S2S3__?: unknown };
      delete w.__NO23_S2S3__;
    }
  };
}

/** Same structural S2→S3 language as the default runtime. */
export async function setupS2S3HandoffRuntimeContinuous(
  args: SetupArgs,
): Promise<() => void> {
  return setupS2S3HandoffRuntime(args);
}
