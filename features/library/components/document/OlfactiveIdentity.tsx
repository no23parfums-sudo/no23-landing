"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  type Variants,
} from "motion/react";
import type { CSSProperties } from "react";
import type {
  NotesChapterPresentation,
  SignatureNote,
} from "../../lib/presentation";

type OlfactiveIdentityProps = {
  signatureNotes?: SignatureNote[];
  chapter?: NotesChapterPresentation;
};

const easeOut = [0.22, 1, 0.36, 1] as const;

const sectionVariants: Variants = {
  hidden: {},
  show: {
    /* Masthead first, then specimen group */
    transition: { staggerChildren: 0.28, delayChildren: 0.06 },
  },
};

const mastheadVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.13, delayChildren: 0.1 },
  },
};

const platesGroupVariants: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.14, delayChildren: 0.08 },
  },
};

const mastheadLineVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOut },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: easeOut },
  },
};

const STAGE_INDEX: Record<string, string> = {
  top: "01",
  heart: "02",
  base: "03",
};

/**
 * Chapter 02 — Archival Triptych.
 * Three simultaneous specimen plates on a warm document field.
 * Data-driven; never fragrance-specific layout.
 */
export function OlfactiveIdentity({
  signatureNotes,
  chapter,
}: OlfactiveIdentityProps) {
  const reduceMotion = useReducedMotion();
  const notes = signatureNotes?.filter((item) => item.note?.name) ?? [];
  if (!notes.length) return null;

  const eyebrow = chapter?.eyebrow ?? "Notas";
  const title = chapter?.title ?? "Ingredientes principales";
  const lede = chapter?.lede;

  return (
    <motion.section
      className="archive-section fragrance-notes"
      aria-labelledby="fragrance-notes-title"
      variants={reduceMotion ? undefined : sectionVariants}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      /* Reveal after the ivory document plane has established */
      viewport={{ once: true, amount: 0.42, margin: "0px 0px -8% 0px" }}
    >
      <motion.header
        className="archive-section__heading fragrance-notes__masthead"
        variants={reduceMotion ? undefined : mastheadVariants}
      >
        <motion.span
          className="archive-section__eyebrow"
          variants={reduceMotion ? undefined : mastheadLineVariants}
        >
          {eyebrow}
        </motion.span>
        <motion.h2
          id="fragrance-notes-title"
          className="archive-section__title"
          variants={reduceMotion ? undefined : mastheadLineVariants}
        >
          {title}
        </motion.h2>
        {lede ? (
          <motion.p
            className="archive-section__lede"
            variants={reduceMotion ? undefined : mastheadLineVariants}
          >
            {lede}
          </motion.p>
        ) : null}
      </motion.header>

      <motion.div
        className="fragrance-notes__triptych"
        variants={reduceMotion ? undefined : platesGroupVariants}
      >
        {notes.map((item, index) => {
          const indexLabel =
            STAGE_INDEX[item.stage] ?? String(index + 1).padStart(2, "0");
          const focus = item.imageFocus ?? "50% 45%";
          const initial = item.note.name.trim().charAt(0).toUpperCase();
          const secondary = item.secondaryNotes?.filter(Boolean) ?? [];

          return (
            <motion.article
              key={item.stage}
              className="note-specimen"
              data-stage={item.stage}
              variants={reduceMotion ? undefined : itemVariants}
            >
              <header className="note-specimen__meta">
                <span className="note-specimen__index" aria-hidden="true">
                  {indexLabel}
                </span>
                <h3 className="note-specimen__stage">{item.label}</h3>
              </header>

              <div
                className="note-specimen__media"
                data-has-image={item.note.imageSrc ? "true" : "false"}
                style={{ "--specimen-focus": focus } as CSSProperties}
              >
                {item.note.imageSrc ? (
                  <Image
                    src={item.note.imageSrc}
                    alt=""
                    fill
                    sizes="(max-width: 900px) 92vw, 360px"
                    className="note-specimen__image"
                    quality={88}
                  />
                ) : (
                  <span className="note-specimen__fallback" aria-hidden="true">
                    {initial}
                  </span>
                )}
              </div>

              <div className="note-specimen__body">
                <p className="note-specimen__name">{item.note.name}</p>
                {item.editorialLine ? (
                  <p className="note-specimen__line">{item.editorialLine}</p>
                ) : null}
                {secondary.length ? (
                  <ul className="note-specimen__taxonomy" aria-label="También">
                    {secondary.map((name) => (
                      <li key={name}>{name}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </motion.section>
  );
}
