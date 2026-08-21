"use client";

import Image from "next/image";
import {
  motion,
  useMotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef } from "react";
import type { NotesChapterPresentation } from "../../lib/presentation";
import {
  FIRMA_LINKED_CLIP_REST,
  FIRMA_LINKED_FROM,
  FIRMA_LINKED_RANGES,
  FIRMA_LINKED_TRAVEL_VH,
} from "./firmaLinkedMotion";

type FirmaLinkedAssemblyProps = {
  notesChapter?: NotesChapterPresentation;
};

const FIRMA_MAIN =
  "/media/perfumes/bleu-de-chanel-edp/edp/bleu-edp-firma-olfativa.png";
const FIRMA_LIQUID =
  "/media/perfumes/bleu-de-chanel-edp/edp/bleu-edp-firma-liquid.png";
const FIRMA_GRAPEFRUIT =
  "/media/perfumes/bleu-de-chanel-edp/edp/bleu-edp-firma-grapefruit.png";
const FIRMA_INCENSE =
  "/media/perfumes/bleu-de-chanel-edp/edp/bleu-edp-firma-incense.png";

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
 * Approved split Firma motion: scroll-linked uncover.
 * Resting grid/CSS is locked. Transforms clamp to identity at progress 1.
 */
export function FirmaLinkedAssembly({
  notesChapter,
}: FirmaLinkedAssemblyProps) {
  const title = notesChapter?.title;
  const lede = notesChapter?.lede;
  const sectionRef = useRef<HTMLElement>(null);
  /**
   * Page `useScroll` keeps Motion on the Lenis/window scroller.
   * Progress is the 50vh mapping of ["start end", "start center"] — that
   * offset is not a ViewTimeline preset, so we measure it from layout.
   */
  useScroll();
  const progress = useMotionValue(0);

  useEffect(() => {
    const node = sectionRef.current;
    node?.setAttribute("data-firma-ready", "1");

    let raf = 0;
    let last = -1;

    const tick = () => {
      const el = sectionRef.current;
      if (el) {
        const vh = window.innerHeight;
        const top = el.getBoundingClientRect().top;
        const span = vh * (FIRMA_LINKED_TRAVEL_VH / 100);
        const p = (vh - top) / span;
        const next = p < 0 ? 0 : p > 1 ? 1 : p;
        if (next !== last) {
          last = next;
          progress.set(next);
          el.setAttribute("data-firma-progress", next.toFixed(3));
        }
      }
      raf = window.requestAnimationFrame(tick);
    };

    raf = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(raf);
  }, [progress]);

  const bottle = FIRMA_LINKED_FROM.bottle;
  const water = FIRMA_LINKED_FROM.water;
  const grapefruit = FIRMA_LINKED_FROM.grapefruit;
  const smoke = FIRMA_LINKED_FROM.smoke;

  const bottleClip = useTransform(progress, FIRMA_LINKED_RANGES.bottle, [
    bottle.clipPath,
    FIRMA_LINKED_CLIP_REST,
  ]);
  const bottleOp = useTransform(progress, FIRMA_LINKED_RANGES.bottle, [
    bottle.opacity,
    1,
  ]);
  const bottleScale = useTransform(progress, FIRMA_LINKED_RANGES.bottle, [
    bottle.scale,
    1,
  ]);
  const bottleY = useTransform(progress, FIRMA_LINKED_RANGES.bottle, [
    bottle.y,
    0,
  ]);

  const waterClip = useTransform(progress, FIRMA_LINKED_RANGES.water, [
    water.clipPath,
    FIRMA_LINKED_CLIP_REST,
  ]);
  const waterOp = useTransform(progress, FIRMA_LINKED_RANGES.water, [
    water.opacity,
    1,
  ]);
  const waterScale = useTransform(progress, FIRMA_LINKED_RANGES.water, [
    water.scale,
    1,
  ]);
  const waterY = useTransform(progress, FIRMA_LINKED_RANGES.water, [
    water.y,
    0,
  ]);

  const grapefruitClip = useTransform(progress, FIRMA_LINKED_RANGES.grapefruit, [
    grapefruit.clipPath,
    FIRMA_LINKED_CLIP_REST,
  ]);
  const grapefruitOp = useTransform(progress, FIRMA_LINKED_RANGES.grapefruit, [
    grapefruit.opacity,
    1,
  ]);
  const grapefruitScale = useTransform(
    progress,
    FIRMA_LINKED_RANGES.grapefruit,
    [grapefruit.scale, 1],
  );
  const grapefruitY = useTransform(progress, FIRMA_LINKED_RANGES.grapefruit, [
    grapefruit.y,
    0,
  ]);

  const smokeClip = useTransform(progress, FIRMA_LINKED_RANGES.smoke, [
    smoke.clipPath,
    FIRMA_LINKED_CLIP_REST,
  ]);
  const smokeOp = useTransform(progress, FIRMA_LINKED_RANGES.smoke, [
    smoke.opacity,
    1,
  ]);
  const smokeScale = useTransform(progress, FIRMA_LINKED_RANGES.smoke, [
    smoke.scale,
    1,
  ]);
  const smokeY = useTransform(progress, FIRMA_LINKED_RANGES.smoke, [
    smoke.y,
    0,
  ]);

  const eyebrowOp = useTransform(progress, FIRMA_LINKED_RANGES.eyebrow, [0, 1]);
  const eyebrowY = useTransform(progress, FIRMA_LINKED_RANGES.eyebrow, [
    FIRMA_LINKED_FROM.copyY,
    0,
  ]);
  const titleOp = useTransform(progress, FIRMA_LINKED_RANGES.title, [0, 1]);
  const titleY = useTransform(progress, FIRMA_LINKED_RANGES.title, [16, 0]);
  const leadOp = useTransform(progress, FIRMA_LINKED_RANGES.lead, [0, 1]);
  const leadY = useTransform(progress, FIRMA_LINKED_RANGES.lead, [
    FIRMA_LINKED_FROM.copyY,
    0,
  ]);
  const supportOp = useTransform(progress, FIRMA_LINKED_RANGES.support, [0, 1]);
  const supportY = useTransform(progress, FIRMA_LINKED_RANGES.support, [
    FIRMA_LINKED_FROM.copyY,
    0,
  ]);

  if (!title && !lede) return null;

  const titleId = title ? "split-editorial-intro-title" : undefined;
  const editorial = lede ? splitEditorialLede(lede) : null;

  return (
    <section
      ref={sectionRef}
      className="split-editorial-intro split-editorial-intro--b"
      data-firma-motion="linked"
      data-firma-reveal="linked"
      data-firma-progress="0"
      aria-labelledby={titleId}
    >
      <div className="firma-b__copy">
        <motion.p
          className="split-editorial-intro__eyebrow"
          style={{ opacity: eyebrowOp, y: eyebrowY }}
        >
          La lectura NO.23
        </motion.p>
        {title ? (
          <motion.h2
            id={titleId}
            className="split-editorial-intro__title"
            style={{ opacity: titleOp, y: titleY }}
          >
            {title}
          </motion.h2>
        ) : null}
        {editorial ? (
          <>
            <motion.p
              className="split-editorial-intro__thesis"
              style={{ opacity: leadOp, y: leadY }}
            >
              {editorial.thesis}
            </motion.p>
            {editorial.support ? (
              <motion.p
                className="split-editorial-intro__support"
                style={{ opacity: supportOp, y: supportY }}
              >
                {editorial.support}
              </motion.p>
            ) : null}
          </>
        ) : null}
      </div>

      <motion.figure
        className="firma-b__bottle"
        style={{
          clipPath: bottleClip,
          opacity: bottleOp,
        }}
      >
        <motion.div
          className="firma-b__media"
          style={{ y: bottleY, scale: bottleScale }}
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
        style={{
          clipPath: grapefruitClip,
          opacity: grapefruitOp,
          y: grapefruitY,
          scale: grapefruitScale,
        }}
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
        style={{
          clipPath: waterClip,
          opacity: waterOp,
          y: waterY,
          scale: waterScale,
        }}
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
        style={{
          clipPath: smokeClip,
          opacity: smokeOp,
          y: smokeY,
          scale: smokeScale,
        }}
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
