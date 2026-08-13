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
    transition: { staggerChildren: 0.05, delayChildren: 0 },
  },
};

const platesGroupVariants: Variants = {
  hidden: {},
  show: {
    /* Minimal stagger — must not invent an empty cream beat */
    transition: { staggerChildren: 0.03, delayChildren: 0 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
};

const STAGE_INDEX: Record<string, string> = {
  top: "01",
  heart: "02",
  base: "03",
};

/**
 * Chapter 02 — Archival Triptych.
 * Three specimen plates on the warm document field.
 * When chapter.revealInHero, the editorial intro lives on the Hero;
 * this section opens directly into the materials.
 */
export function OlfactiveIdentity({
  signatureNotes,
  chapter,
}: OlfactiveIdentityProps) {
  const reduceMotion = useReducedMotion();
  const notes = signatureNotes?.filter((item) => item.note?.name) ?? [];
  if (!notes.length) return null;

  const revealInHero = Boolean(chapter?.revealInHero);
  const title =
    chapter?.title ??
    chapter?.eyebrow ??
    "Notas Signatura";
  /*
   * Cream-handoff path: plates must be fully opaque before the document
   * becomes visible. No enter opacity animation / whileInView gate — those
   * produce a one-frame empty cream flash on fast downward scroll.
   */
  const rideCreamPlane = revealInHero;

  return (
    <motion.section
      className={
        revealInHero
          ? "archive-section fragrance-notes fragrance-notes--hero-intro"
          : "archive-section fragrance-notes"
      }
      aria-labelledby="fragrance-notes-title"
      variants={
        reduceMotion || rideCreamPlane ? undefined : sectionVariants
      }
      initial={reduceMotion || rideCreamPlane ? false : "hidden"}
      whileInView={
        reduceMotion || rideCreamPlane ? undefined : "show"
      }
      viewport={
        reduceMotion || rideCreamPlane
          ? undefined
          : { once: true, amount: 0.08, margin: "0px 0px 12% 0px" }
      }
    >
      <h2 id="fragrance-notes-title" className="sr-only">
        {title}
      </h2>

      {!revealInHero ? (
        <header className="archive-section__heading fragrance-notes__masthead">
          {chapter?.index ? (
            <span className="archive-section__index">{chapter.index}</span>
          ) : null}
          {chapter?.eyebrow ? (
            <span className="archive-section__eyebrow">{chapter.eyebrow}</span>
          ) : null}
          {chapter?.title ? (
            <p className="archive-section__title">{chapter.title}</p>
          ) : null}
          {chapter?.lede ? (
            <p className="archive-section__lede">{chapter.lede}</p>
          ) : null}
        </header>
      ) : null}

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
              variants={
                reduceMotion || rideCreamPlane ? undefined : itemVariants
              }
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
                    priority={rideCreamPlane && index < 3}
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
