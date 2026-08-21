"use client";

import { motion, useReducedMotion } from "motion/react";
import type { PerformanceVariantModel } from "../../../lib/performanceVariantModel";

type PerformanceChapterPlateProps = {
  model: PerformanceVariantModel;
  reduceMotion: boolean;
};

const ease = [0.22, 1, 0.36, 1] as const;

const FIELD_LINES = [
  {
    d: "M78 132 C148 118 214 86 286 58 C322 44 352 42 382 54",
    width: 1.2,
    tone: "navy",
  },
  {
    d: "M76 136 C154 130 228 124 308 112 C344 104 368 108 392 122",
    width: 1.05,
    tone: "blue",
  },
  {
    d: "M80 140 C146 156 218 182 292 204 C328 218 356 230 384 238",
    width: 0.95,
    tone: "navy",
  },
  {
    d: "M82 126 C160 94 236 62 318 46 C348 38 366 44 380 62",
    width: 0.8,
    tone: "steel",
  },
  {
    d: "M74 144 C138 172 206 208 270 224 C312 236 348 242 378 232",
    width: 0.7,
    tone: "line",
  },
  {
    d: "M84 134 C168 140 252 158 330 180 C356 190 372 206 388 224",
    width: 0.65,
    tone: "blue",
  },
] as const;

/**
 * Editorial chapter plate — Architecture → Performance.
 * Right pane is an olfactory field, not a metric preview.
 */
export function PerformanceChapterPlate({
  reduceMotion,
}: PerformanceChapterPlateProps) {
  const reduced = reduceMotion || Boolean(useReducedMotion());

  return (
    <div className="perf-plate">
      <div className="perf-plate__copy">
        <motion.p
          className="perf-plate__kicker"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.5, ease }}
        >
          04 / Performance
        </motion.p>
        <motion.h2
          id="performance-title-x"
          className="perf-plate__title"
          initial={reduced ? false : { opacity: 0, y: 10 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.58, delay: reduced ? 0 : 0.06, ease }}
        >
          Cómo se comporta
        </motion.h2>
        <motion.p
          className="perf-plate__dek"
          initial={reduced ? false : { opacity: 0, y: 8 }}
          whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5, delay: reduced ? 0 : 0.12, ease }}
        >
          Una lectura de su presencia,
          <br />
          duración y versatilidad.
        </motion.p>
      </div>

      <div className="perf-plate__figure" aria-hidden="true">
        <OlfactoryField reduced={reduced} />
      </div>
    </div>
  );
}

function OlfactoryField({ reduced }: { reduced: boolean }) {
  return (
    <svg
      className="perf-plate__svg"
      viewBox="0 0 420 280"
      fill="none"
      aria-hidden="true"
    >
      {FIELD_LINES.map((line, i) => (
        <motion.path
          key={line.d}
          d={line.d}
          className={`perf-plate__field perf-plate__field--${line.tone}`}
          strokeWidth={line.width}
          strokeLinecap="round"
          strokeDasharray="0 1"
          fill="none"
          initial={reduced ? false : { pathLength: 0 }}
          whileInView={reduced ? undefined : { pathLength: 1 }}
          viewport={{ once: true, amount: 0.45 }}
          transition={{
            duration: 0.88,
            delay: reduced ? 0 : 0.04 + i * 0.07,
            ease,
          }}
        />
      ))}
      <motion.circle
        cx="78"
        cy="134"
        r="2.6"
        className="perf-plate__navy-fill"
        initial={reduced ? false : { opacity: 0, scale: 0.6 }}
        whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.45, delay: reduced ? 0 : 0.72, ease }}
      />
      <motion.circle
        cx="286"
        cy="58"
        r="2.1"
        className="perf-plate__amber-fill"
        initial={reduced ? false : { opacity: 0 }}
        whileInView={reduced ? undefined : { opacity: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4, delay: reduced ? 0 : 0.86, ease }}
      />
      <motion.circle
        cx="308"
        cy="112"
        r="1.5"
        className="perf-plate__blue-fill"
        initial={reduced ? false : { opacity: 0 }}
        whileInView={reduced ? undefined : { opacity: 0.85 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.4, delay: reduced ? 0 : 0.94, ease }}
      />
    </svg>
  );
}
