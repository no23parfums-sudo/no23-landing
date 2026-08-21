"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ArchitecturePresentation } from "../../lib/presentation";

type SplitChapterCueProps = {
  architecture?: ArchitecturePresentation | null;
};

const easeOut = [0.22, 1, 0.36, 1] as const;

/**
 * Compact chapter marker between Firma and Arquitectura.
 * Orientation only — not a standalone editorial section.
 */
export function SplitChapterCue({ architecture }: SplitChapterCueProps) {
  const reduceMotion = useReducedMotion();
  const intro = architecture?.intro;
  const rawEyebrow =
    intro?.eyebrow ?? architecture?.eyebrow ?? "Arquitectura Olfativa";
  const eyebrow = rawEyebrow.replace(/^\s*\d+\s*\/\s*/, "").trim();
  const stages =
    architecture?.stages
      ?.map((stage) => stage.label)
      .filter(Boolean) ??
    intro?.stagesLabel
      ?.split(/\s*[—–-]\s*/)
      .filter(Boolean) ??
    [];

  if (!eyebrow && !stages.length) return null;

  return (
    <div
      className="split-chapter-cue"
      aria-label={eyebrow || "Arquitectura olfativa"}
    >
      {eyebrow ? (
        <motion.span
          className="split-chapter-cue__eyebrow"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.48, ease: easeOut }}
        >
          {eyebrow}
        </motion.span>
      ) : null}
      {stages.length ? (
        <motion.span
          className="split-chapter-cue__stages"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.48, delay: 0.06, ease: easeOut }}
        >
          {stages.map((label) => (
            <span key={label} className="split-chapter-cue__stage">
              {label}
            </span>
          ))}
        </motion.span>
      ) : null}
    </div>
  );
}
