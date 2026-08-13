"use client";

import { useEffect, useRef } from "react";

type HeroFirmaFilmProps = {
  src: string;
};

/**
 * Play once when master firma-progress crosses this (conceptual ~35%).
 * Hysteresis on reverse avoids chatter — not a second stage.
 */
const PLAY_AT = 0.35;
const PLAY_RELEASE = 0.26;

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function readFirmaProgress(shell: HTMLElement | null): number {
  if (!shell) return 0;
  const raw = shell.style.getPropertyValue("--firma-progress").trim();
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

function readFilmOpacity(shell: HTMLElement | null): number {
  if (!shell) return 0;
  const raw = shell.style.getPropertyValue("--firma-film-opacity").trim();
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

function readPhotoFade(shell: HTMLElement | null): number {
  if (!shell) return 0;
  const raw = shell.style.getPropertyValue("--hero-photo-fade").trim();
  const n = Number.parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Film A — lifecycle only.
 * Opacity ownership is written by HeroTransition from --firma-progress.
 * This component prepares, plays, pauses, and parks from the same progress.
 *
 * During Firma → Notes, Film A stays painted under the rising document;
 * the atmosphere layer recesses via --hero-photo-fade (do not blank early).
 */
export function HeroFirmaFilm({ src }: HeroFirmaFilmProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("muted", "");
    video.preload = "auto";

    let disposed = false;
    let frameReady = false;
    let playLatched = false;
    let needsPark = false;
    let wasVisible = false;
    let raf = 0;

    const applyVisual = (opacity: number) => {
      const o = clamp01(opacity);
      const raw = o.toFixed(4);
      video.style.setProperty("--firma-film-opacity", raw);
      video.parentElement?.style.setProperty("--firma-film-opacity", raw);
      video.dataset.active = o > 0.01 ? "true" : "false";
    };

    const parkAtZero = () => {
      if (!needsPark) return;
      needsPark = false;
      try {
        video.pause();
        if (Math.abs(video.currentTime) > 0.02) {
          video.currentTime = 0;
        }
      } catch {
        /* ignore */
      }
    };

    const prepare = async () => {
      if (video.readyState < 2) {
        await new Promise<void>((resolve) => {
          const done = () => {
            video.removeEventListener("loadeddata", done);
            video.removeEventListener("canplay", done);
            resolve();
          };
          video.addEventListener("loadeddata", done);
          video.addEventListener("canplay", done);
          try {
            video.load();
          } catch {
            /* ignore */
          }
          window.setTimeout(done, 2000);
        });
      }
      if (disposed) return;

      await new Promise<void>((resolve) => {
        let finished = false;
        const finish = () => {
          if (finished) return;
          finished = true;
          video.removeEventListener("seeked", finish);
          resolve();
        };
        video.addEventListener("seeked", finish);
        try {
          video.pause();
          video.currentTime = 0;
        } catch {
          finish();
        }
        window.setTimeout(finish, 1500);
      });
      if (disposed) return;

      video.pause();
      frameReady = true;
      video.dataset.ready = "true";
      applyVisual(0);
    };

    const tryPlayFromStart = () => {
      if (playLatched || !frameReady) return;
      playLatched = true;
      try {
        if (video.currentTime > 0.04) video.currentTime = 0;
      } catch {
        /* ignore */
      }
      void video.play().catch(() => {
        playLatched = false;
      });
    };

    const sync = () => {
      if (disposed) return;
      const shell = document.querySelector<HTMLElement>("[data-perfume-shell]");
      const firmaProgress = readFirmaProgress(shell);
      const photoFade = readPhotoFade(shell);

      /*
       * Use the shell media token only — do not blank on document phase.
       * Atmosphere recession (--hero-photo-fade) hides Film A under Notes.
       */
      let opacity = readFilmOpacity(shell);
      if (!frameReady) opacity = 0;

      applyVisual(opacity);

      /* Atmosphere effectively gone — pause/park once, never while still visible */
      const visuallyHidden = opacity <= 0.01 || photoFade >= 0.9;

      if (!visuallyHidden) {
        wasVisible = true;
        needsPark = true;
      }

      if (!visuallyHidden && firmaProgress >= PLAY_AT) {
        tryPlayFromStart();
      } else if (
        playLatched &&
        (visuallyHidden || firmaProgress < PLAY_RELEASE)
      ) {
        playLatched = false;
        if (!video.paused) video.pause();
      }

      if (visuallyHidden && wasVisible) {
        wasVisible = false;
        playLatched = false;
        if (!video.paused) video.pause();
        parkAtZero();
      }
    };

    const scheduleSync = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        sync();
      });
    };

    void prepare().then(() => {
      if (!disposed) sync();
    });

    const shell = document.querySelector("[data-perfume-shell]");
    const mo = shell ? new MutationObserver(scheduleSync) : null;
    mo?.observe(shell!, {
      attributes: true,
      attributeFilter: ["data-hero-phase", "data-hero-chapter", "style"],
    });

    window.addEventListener("scroll", scheduleSync, { passive: true });

    const onVis = () => {
      if (document.hidden) {
        if (!video.paused) video.pause();
        return;
      }
      scheduleSync();
    };
    document.addEventListener("visibilitychange", onVis);

    applyVisual(0);
    video.dataset.ready = "false";
    video.dataset.active = "false";

    return () => {
      disposed = true;
      mo?.disconnect();
      window.removeEventListener("scroll", scheduleSync);
      document.removeEventListener("visibilitychange", onVis);
      if (raf) window.cancelAnimationFrame(raf);
      applyVisual(0);
      video.parentElement?.style.removeProperty("--firma-film-opacity");
      try {
        video.pause();
      } catch {
        /* ignore */
      }
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      className="perfume-hero__atmosphere-video"
      data-active="false"
      data-ready="false"
      src={src}
      muted
      playsInline
      loop
      preload="auto"
      tabIndex={-1}
      aria-hidden="true"
    />
  );
}
