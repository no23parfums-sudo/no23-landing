"use client";

import {
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import type {
  PerformancePresentation,
  SpectrumReading,
} from "../../lib/presentation";
import { PerformanceScale } from "./PerformanceScale";

const LONGEVITY_MARKS = [
  { label: "2H", at: 0.2 },
  { label: "4H", at: 0.4 },
  { label: "6H", at: 0.6 },
  { label: "8H", at: 0.8 },
  { label: "10H+", at: 1 },
];

const PROJECTION_MARKS = [
  { label: "Piel", at: 0 },
  { label: "Cercana", at: 1 / 3 },
  { label: "Presente", at: 2 / 3 },
  { label: "Amplia", at: 1 },
];

const SILLAGE_MARKS = [
  { label: "Contenida", at: 0 },
  { label: "Moderada", at: 0.5 },
  { label: "Marcada", at: 1 },
];

const SEASON_TONES: Record<string, string> = {
  primavera: "#7d8a74",
  verano: "#a88b4a",
  otono: "#7a5340",
  invierno: "#5a6a78",
};

const easeOut = [0.22, 1, 0.36, 1] as const;

const sceneVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

const visualVariants: Variants = {
  hidden: { opacity: 0, clipPath: "inset(0 12% 0 0)" },
  show: {
    opacity: 1,
    clipPath: "inset(0 0% 0 0)",
    transition: { duration: 1.05, ease: easeOut },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.78, ease: easeOut },
  },
};

function formatHoursValue(range?: { min: number; max: number } | null) {
  if (!range || range.min <= 0 || range.max < range.min) return null;
  return `${range.min}–${range.max} H`;
}

function splitToneKey(label: string) {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function spectrumWeight(
  reading: SpectrumReading,
  index: number,
  label: string,
): number {
  const w = reading.weights?.[index];
  if (typeof w === "number") return Math.min(1, Math.max(0, w));
  return reading.active.includes(label) ? 0.88 : 0.22;
}

type SplitPerformanceProps = {
  performance?: PerformancePresentation;
  smokeFilmSrc?: string;
};

/**
 * Experimental Performance scene — atmospheric visual + editorial metrics.
 */
export function SplitPerformance({
  performance,
  smokeFilmSrc,
}: SplitPerformanceProps) {
  const reduceMotion = Boolean(useReducedMotion());
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLElement>(null);

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
  }, [reduceMotion, smokeFilmSrc]);

  if (!performance?.longevity?.reading) return null;

  const longevity = performance.longevity;
  const projection = performance.projection;
  const sillage = performance.sillage;
  const seasons = performance.seasons;
  const occasions = performance.occasions;
  const versatility = performance.versatility;
  const hours = formatHoursValue(longevity.hoursRange);

  return (
    <motion.section
      ref={rootRef}
      className="performance-section performance-section--split-static"
      aria-labelledby="performance-title"
      data-settled={reduceMotion ? "true" : "false"}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={{ once: true, amount: 0.28 }}
      variants={reduceMotion ? undefined : sceneVariants}
      onViewportEnter={() => {
        requestAnimationFrame(() => {
          if (rootRef.current) rootRef.current.dataset.settled = "true";
        });
      }}
    >
      <div className="split-perf__scene">
        <motion.div
          className="split-perf__visual"
          variants={reduceMotion ? undefined : visualVariants}
          aria-hidden="true"
        >
          {smokeFilmSrc ? (
            <video
              ref={videoRef}
              className="split-perf__film"
              src={smokeFilmSrc}
              muted
              loop
              playsInline
              preload="metadata"
              tabIndex={-1}
            />
          ) : (
            <div className="split-perf__placeholder" />
          )}
          <div className="split-perf__visual-veil" />
        </motion.div>

        <div className="split-perf__data">
          <motion.header
            className="split-perf__head"
            variants={reduceMotion ? undefined : itemVariants}
          >
            <p className="split-perf__kicker">Performance / Lectura NO.23</p>
            <h2 id="performance-title" className="split-perf__title">
              Cómo se comporta
            </h2>
          </motion.header>

          <div className="split-perf__board">
            <motion.div variants={reduceMotion ? undefined : itemVariants}>
              <SplitMetric
                id="longevity"
                title="Longevidad"
                value={hours}
                support={longevity.reading}
              >
                <PerformanceScale
                  value={longevity.position ?? 0.7}
                  marks={LONGEVITY_MARKS}
                  ariaLabel={
                    hours
                      ? `${longevity.reading}. ${hours}`
                      : longevity.reading
                  }
                />
              </SplitMetric>
            </motion.div>

            <div className="split-perf__pair">
              {projection ? (
                <motion.div variants={reduceMotion ? undefined : itemVariants}>
                  <SplitMetric
                    id="projection"
                    title="Proyección"
                    value={projection.marker ?? projection.reading}
                    support={
                      projection.reading !== projection.marker
                        ? projection.reading
                        : null
                    }
                  >
                    <PerformanceScale
                      value={projection.position ?? 0.5}
                      marks={PROJECTION_MARKS}
                      ariaLabel={projection.reading}
                    />
                  </SplitMetric>
                </motion.div>
              ) : null}

              {sillage ? (
                <motion.div variants={reduceMotion ? undefined : itemVariants}>
                  <SplitMetric
                    id="sillage"
                    title="Sillage"
                    value={sillage.marker ?? sillage.reading}
                    support={
                      sillage.reading !== sillage.marker
                        ? sillage.reading
                        : null
                    }
                  >
                    <PerformanceScale
                      value={sillage.position ?? 0.45}
                      marks={SILLAGE_MARKS}
                      ariaLabel={sillage.reading}
                    />
                  </SplitMetric>
                </motion.div>
              ) : null}
            </div>

            <div className="split-perf__context">
              {seasons ? (
                <motion.div variants={reduceMotion ? undefined : itemVariants}>
                  <SplitMetric
                    id="season"
                    title="Estación"
                    support={seasons.reading}
                  >
                    <SplitSpectrumRows
                      reading={seasons}
                      ariaLabel={seasons.reading}
                      coloured
                    />
                  </SplitMetric>
                </motion.div>
              ) : null}

              {occasions ? (
                <motion.div variants={reduceMotion ? undefined : itemVariants}>
                  <SplitMetric
                    id="occasion"
                    title="Ocasión"
                    support={occasions.reading}
                  >
                    <SplitSpectrumRows
                      reading={occasions}
                      ariaLabel={occasions.reading}
                    />
                  </SplitMetric>
                </motion.div>
              ) : null}

              {versatility ? (
                <motion.div variants={reduceMotion ? undefined : itemVariants}>
                  <SplitMetric
                    id="versatility"
                    title="Versatilidad"
                    value={versatility.marker ?? versatility.reading}
                  >
                    <PerformanceScale
                      value={versatility.position ?? 0.65}
                      marks={[
                        {
                          label: versatility.poles?.[0] ?? "Especializada",
                          at: 0,
                        },
                        {
                          label: versatility.poles?.[1] ?? "Muy versátil",
                          at: 1,
                        },
                      ]}
                      ariaLabel={versatility.reading}
                      className="perf-scale--versatility"
                    />
                  </SplitMetric>
                </motion.div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function SplitSpectrumRows({
  reading,
  ariaLabel,
  coloured,
}: {
  reading: SpectrumReading;
  ariaLabel: string;
  coloured?: boolean;
}) {
  return (
    <ul className="split-perf__rows" role="list" aria-label={ariaLabel}>
      {reading.spectrum.slice(0, 4).map((label, i) => {
        const weight = spectrumWeight(reading, i, label);
        const tone = coloured ? SEASON_TONES[splitToneKey(label)] : undefined;
        return (
          <li
            key={label}
            className="split-perf__row"
            data-tone={splitToneKey(label)}
          >
            <span className="split-perf__row-label">{label}</span>
            <PerformanceScale
              value={weight}
              ariaLabel={`${label}: ${Math.round(weight * 100)}`}
              tone={tone}
              className="perf-scale--row"
            />
          </li>
        );
      })}
    </ul>
  );
}

function SplitMetric({
  id,
  title,
  value,
  support,
  children,
}: {
  id: string;
  title: string;
  value?: string | null;
  support?: string | null;
  children: ReactNode;
}) {
  return (
    <article className="split-perf__group" data-metric={id}>
      <p className="split-perf__eyebrow">{title}</p>
      <div className="split-perf__lead">
        {value ? <p className="split-perf__value">{value}</p> : null}
        {support && support !== value ? (
          <p className="split-perf__support">{support}</p>
        ) : null}
      </div>
      <div className="split-perf__instrument">{children}</div>
    </article>
  );
}
