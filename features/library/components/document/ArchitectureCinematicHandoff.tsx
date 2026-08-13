"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "motion/react";
import { setupArchitectureCinematicRuntime } from "./architectureCinematicRuntime";

type ArchitectureCinematicHandoffProps = {
  smokeFilmSrc: string;
  bridgeTime?: number;
};

/**
 * Legacy Architecture → Smoke bridge.
 * Kept for comparison; disabled while Smoke opens Performance (see PerfumeDocument).
 * Runtime (`architectureCinematicRuntime.ts`) remains intact.
 */
export const LEGACY_ARCH_SMOKE_BRIDGE = false;

/**
 * Post-Architecture cinematic stage (EDP smoke film).
 * Runway stays in document flow; fixed stage portals to body.
 */
export function ArchitectureCinematicHandoff({
  smokeFilmSrc,
  bridgeTime = 7.5,
}: ArchitectureCinematicHandoffProps) {
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const video = videoRef.current;
    if (!mounted || !root || !video) return;

    const ac = new AbortController();
    let cleanup: (() => void) | undefined;

    void setupArchitectureCinematicRuntime({
      root,
      video,
      bridgeTime,
      reduceMotion: Boolean(reduceMotion),
      signal: ac.signal,
    }).then((teardown) => {
      if (ac.signal.aborted) {
        teardown();
        return;
      }
      cleanup = teardown;
    });

    return () => {
      ac.abort();
      cleanup?.();
    };
  }, [mounted, reduceMotion, smokeFilmSrc, bridgeTime]);

  const stage = (
    <section
      ref={rootRef}
      className="arch-cinematic"
      data-ready="false"
      data-active="false"
      data-phase="idle"
      data-entry={bridgeTime}
      aria-label="Momento cinematográfico"
      aria-hidden="true"
    >
      <div className="arch-cinematic__underlay" aria-hidden="true" />
      <div className="arch-cinematic__pin">
        <div className="arch-cinematic__stage">
          <div className="arch-cinematic__film" aria-hidden="true">
            <video
              ref={videoRef}
              className="arch-cinematic__video"
              src={smokeFilmSrc}
              muted
              playsInline
              preload="metadata"
              tabIndex={-1}
            />
          </div>
          <div className="arch-cinematic__veil" aria-hidden="true" />
          <div className="arch-cinematic__shade" aria-hidden="true" />
        </div>
      </div>
    </section>
  );

  return (
    <>
      <div className="arch-cinematic-run" aria-hidden="true" />
      {mounted ? createPortal(stage, document.body) : null}
    </>
  );
}
