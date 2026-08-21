"use client";

import { useEffect, useRef } from "react";

type PerfVariantVisualProps = {
  src?: string;
  className?: string;
  reduceMotion: boolean;
  /** CSS object-fit. Default contain keeps A/B unchanged. */
  fit?: "contain" | "cover";
  onRatio?: (width: number, height: number) => void;
};

/** Shared Section 4 visual — same source bytes, crop only via CSS. */
export function PerfVariantVisual({
  src,
  className,
  reduceMotion,
  fit = "contain",
  onRatio,
}: PerfVariantVisualProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || reduceMotion) return;
    const play = () => {
      void video.play().catch(() => undefined);
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) play();
        else video.pause();
      },
      { threshold: 0.2 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reduceMotion, src]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const publish = () => {
      if (!video.videoWidth || !video.videoHeight) return;
      frameRef.current?.style.setProperty(
        "--film-ratio",
        `${video.videoWidth} / ${video.videoHeight}`,
      );
      onRatio?.(video.videoWidth, video.videoHeight);
    };
    if (video.readyState >= 1) publish();
    video.addEventListener("loadedmetadata", publish);
    return () => video.removeEventListener("loadedmetadata", publish);
  }, [onRatio, src]);

  return (
    <div
      ref={frameRef}
      className={className}
      data-fit={fit}
      aria-hidden="true"
    >
      {src ? (
        <video
          ref={videoRef}
          className="perf-v__film"
          style={{ objectPosition: "var(--film-position, 50% 50%)" }}
          src={src}
          muted
          loop
          playsInline
          preload="metadata"
          tabIndex={-1}
        />
      ) : (
        <div className="perf-v__film perf-v__film--empty" />
      )}
    </div>
  );
}
