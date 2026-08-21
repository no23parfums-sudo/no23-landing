"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef } from "react";
import type { NotesChapterPresentation } from "../../lib/presentation";
import {
  copyAssemble,
  photoUncover,
  useHeroArmedReveal,
} from "./sceneHandoff";
import { FirmaLinkedAssembly } from "./FirmaLinkedAssembly";

type SplitEditorialIntroProps = {
  notesChapter?: NotesChapterPresentation;
  firmaMotion?: "linked" | "timed";
};

const FIRMA_MAIN =
  "/media/perfumes/bleu-de-chanel-edp/edp/bleu-edp-firma-olfativa.png";
const FIRMA_LIQUID =
  "/media/perfumes/bleu-de-chanel-edp/edp/bleu-edp-firma-liquid.png";
const FIRMA_GRAPEFRUIT =
  "/media/perfumes/bleu-de-chanel-edp/edp/bleu-edp-firma-grapefruit.png";
const FIRMA_INCENSE =
  "/media/perfumes/bleu-de-chanel-edp/edp/bleu-edp-firma-incense.png";

/** Presentation-only split of the existing lede. Does not rewrite copy. */
function splitEditorialLede(lede: string): { thesis: string; support?: string } {
  const colon = lede.indexOf(":");
  if (colon === -1) return { thesis: lede };
  let thesis = lede.slice(0, colon).trim();
  if (thesis && !/[.!?…]$/.test(thesis)) thesis = `${thesis}.`;
  const rest = lede.slice(colon + 1).trim();
  if (!rest) return { thesis };
  const support = rest.charAt(0).toLocaleUpperCase("es-ES") + rest.slice(1);
  return { thesis, support };
}

function FirmaPhoto({
  src,
  className,
  sizes,
}: {
  src: string;
  className: string;
  sizes: string;
}) {
  return (
    <Image
      src={src}
      alt=""
      fill
      sizes={sizes}
      quality={100}
      unoptimized
      className={className}
    />
  );
}

/**
 * Split Firma — approved master-template motion is scroll-linked assembly.
 * Resting grid/copy is locked. Timed uncover remains a dev fallback
 * (`?firmaMotion=timed`) and the reduced-motion path.
 */
export function SplitEditorialIntro({
  notesChapter,
  firmaMotion = "linked",
}: SplitEditorialIntroProps) {
  const reduceMotion = Boolean(useReducedMotion());
  if (firmaMotion === "timed" || reduceMotion) {
    return (
      <FirmaTimedAssembly
        notesChapter={notesChapter}
        reduceMotion={reduceMotion}
      />
    );
  }

  return <FirmaLinkedAssembly notesChapter={notesChapter} />;
}

function FirmaTimedAssembly({
  notesChapter,
  reduceMotion,
}: {
  notesChapter?: NotesChapterPresentation;
  reduceMotion: boolean;
}) {
  const title = notesChapter?.title;
  const lede = notesChapter?.lede;
  const sectionRef = useRef<HTMLElement>(null);
  const play = useHeroArmedReveal(sectionRef, reduceMotion);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const mediaY = useTransform(scrollYProgress, [0, 1], [0, -8]);

  if (!title && !lede) return null;

  const titleId = title ? "split-editorial-intro-title" : undefined;
  const editorial = lede ? splitEditorialLede(lede) : null;
  const motionOff = reduceMotion;

  return (
    <section
      ref={sectionRef}
      className="split-editorial-intro split-editorial-intro--b"
      data-firma-reveal={play ? "settled" : "armed"}
      aria-labelledby={titleId}
    >
      <div className="firma-b__copy">
        <motion.p
          className="split-editorial-intro__eyebrow"
          initial={motionOff ? false : "hidden"}
          animate={play ? "show" : "hidden"}
          variants={motionOff ? undefined : copyAssemble(0.52, 8, 0.5)}
        >
          La lectura NO.23
        </motion.p>
        {title ? (
          <motion.h2
            id={titleId}
            className="split-editorial-intro__title"
            initial={motionOff ? false : "hidden"}
            animate={play ? "show" : "hidden"}
            variants={motionOff ? undefined : copyAssemble(0.6, 12, 0.54)}
          >
            {title}
          </motion.h2>
        ) : null}
        {editorial ? (
          <>
            <motion.p
              className="split-editorial-intro__thesis"
              initial={motionOff ? false : "hidden"}
              animate={play ? "show" : "hidden"}
              variants={motionOff ? undefined : copyAssemble(0.68, 8, 0.5)}
            >
              {editorial.thesis}
            </motion.p>
            {editorial.support ? (
              <motion.p
                className="split-editorial-intro__support"
                initial={motionOff ? false : "hidden"}
                animate={play ? "show" : "hidden"}
                variants={motionOff ? undefined : copyAssemble(0.76, 8, 0.48)}
              >
                {editorial.support}
              </motion.p>
            ) : null}
          </>
        ) : null}
      </div>

      <motion.figure
        className="firma-b__bottle"
        initial={motionOff ? false : "hidden"}
        animate={play ? "show" : "hidden"}
        variants={motionOff ? undefined : photoUncover(0, 24, 1.03, 10, 0.88)}
      >
        <motion.div
          className="firma-b__media"
          style={play && !motionOff ? { y: mediaY } : undefined}
        >
          <FirmaPhoto
            src={FIRMA_MAIN}
            sizes="(max-width: 900px) calc(100vw - 64px), 46vw"
            className="firma-b__image firma-b__image--main"
          />
        </motion.div>
      </motion.figure>

      <motion.figure
        className="firma-b__silk"
        data-firma-index="03"
        aria-hidden="true"
        initial={motionOff ? false : "hidden"}
        animate={play ? "show" : "hidden"}
        variants={motionOff ? undefined : photoUncover(0.175, 14, 1.012, 7, 0.62)}
      >
        <FirmaPhoto
          src={FIRMA_GRAPEFRUIT}
          sizes="(max-width: 900px) 48vw, 22vw"
          className="firma-b__image firma-b__image--grapefruit"
        />
      </motion.figure>

      <motion.figure
        className="firma-b__water"
        data-firma-index="02"
        aria-hidden="true"
        initial={motionOff ? false : "hidden"}
        animate={play ? "show" : "hidden"}
        variants={motionOff ? undefined : photoUncover(0.1, 36, 1.002, 14, 0.72)}
      >
        <FirmaPhoto
          src={FIRMA_LIQUID}
          sizes="(max-width: 900px) calc(100vw - 64px), 32vw"
          className="firma-b__image firma-b__image--liquid"
        />
      </motion.figure>

      <motion.figure
        className="firma-b__stone"
        data-firma-index="04"
        aria-hidden="true"
        initial={motionOff ? false : "hidden"}
        animate={play ? "show" : "hidden"}
        variants={motionOff ? undefined : photoUncover(0.25, 26, 1.008, 11, 0.82)}
      >
        <FirmaPhoto
          src={FIRMA_INCENSE}
          sizes="(max-width: 900px) 48vw, 22vw"
          className="firma-b__image firma-b__image--incense"
        />
      </motion.figure>
    </section>
  );
}
