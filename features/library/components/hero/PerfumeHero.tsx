"use client";

import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "motion/react";
import { useState, type CSSProperties } from "react";
import type {
  CollectionMember,
  PerfumePresentation,
} from "../../lib/presentation";
import { EditorialSentence } from "./EditorialSentence";
import { HeroChapterIndex } from "./HeroChapterIndex";
import { HeroTransition } from "./HeroTransition";
import { HeroVariantSelector } from "./HeroVariantSelector";

export type PerfumeHeroProps = {
  presentation: PerfumePresentation;
  concentration?: string | null;
  year?: number | null;
  commercialStatus?: string | null;
};

const easeOut = [0.22, 1, 0.36, 1] as const;

const stageVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.16 },
  },
};

const groupVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.07, delayChildren: 0.04 },
  },
};

const itemVariants = {
  /* Keep a trace of opacity so SSR / first paint never reads as an empty stage */
  hidden: { opacity: 0.12, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.75, ease: easeOut },
  },
};

const plateTransition = {
  duration: 0.9,
  ease: easeOut,
};

const copyTransition = {
  duration: 0.4,
  ease: easeOut,
};

function resolveDefaultSlug(
  members: CollectionMember[],
  concentration?: string | null,
): string | null {
  return (
    members.find((member) => member.current)?.slug ??
    members.find((member) => member.concentration === concentration)?.slug ??
    members[0]?.slug ??
    null
  );
}

/**
 * Editorial perfume opening — cinematic study, not a product card.
 * Typography + product photography lead. Data-driven; never fragrance-specific.
 */
export function PerfumeHero({
  presentation,
  concentration,
  year,
}: PerfumeHeroProps) {
  const reduceMotion = useReducedMotion();
  const {
    atmosphere,
    brandName,
    brandLogoSrc,
    heroName,
    heroTitleLines,
    editorialSrc,
    bottleSrc,
    archivalCaption,
    catalogRef,
    heroTagline,
    perfumer,
    variants,
    collection,
    olfactiveFamily,
    origin,
  } = presentation;

  const variantMembers = variants ?? collection?.members ?? [];
  const [selectedSlug, setSelectedSlug] = useState<string | null>(() =>
    resolveDefaultSlug(variantMembers, concentration),
  );

  const activeMember =
    variantMembers.find((member) => member.slug === selectedSlug) ??
    variantMembers.find((member) => member.current) ??
    null;

  const activeEditorialSrc =
    activeMember?.editorialSrc ?? editorialSrc ?? null;
  const activeFocus = activeMember?.heroFocus ?? "50% 48%";
  const activeDescriptor =
    activeMember?.descriptor ?? heroTagline ?? null;
  const activeSummary =
    activeMember?.editorialSummary ?? archivalCaption ?? null;
  const activePerfumer =
    activeMember?.perfumer ?? perfumer?.name ?? null;
  const activeYear =
    activeMember?.year ?? year ?? presentation.yearFallback ?? null;
  const activeFamily =
    activeMember?.olfactiveFamily ?? olfactiveFamily ?? null;
  const activeCatalogRef =
    activeMember?.catalogRef ?? catalogRef ?? null;

  const hasEditorial = Boolean(activeEditorialSrc);
  const showBottle = Boolean(bottleSrc) && !hasEditorial;
  const canSwapPlates = variantMembers.some((member) => member.editorialSrc);
  const copyKey = selectedSlug ?? "default";

  const titleLines =
    heroTitleLines?.filter(Boolean).length
      ? heroTitleLines.filter(Boolean)
      : [heroName];
  const hasMetaRail = Boolean(
    activeFamily || origin || activeYear != null || activePerfumer,
  );

  return (
    <HeroTransition>
      {({ pinRef, entered }) => (
        <section
          ref={pinRef}
          className="perfume-hero-scroll"
          aria-label={`${heroName} — apertura`}
        >
          <div
            className="perfume-hero"
            data-atmosphere={atmosphere}
            data-entered={entered ? "true" : "false"}
            data-has-editorial={hasEditorial ? "true" : "false"}
            data-has-bottle={showBottle ? "true" : "false"}
          >
            {activeEditorialSrc ? (
              <div className="perfume-hero__atmosphere" aria-hidden="true">
                <AnimatePresence initial={false} mode="sync">
                  <motion.div
                    key={activeEditorialSrc}
                    className="perfume-hero__atmosphere-plate"
                    style={
                      {
                        "--hero-focus": activeFocus,
                      } as CSSProperties
                    }
                    initial={
                      reduceMotion
                        ? false
                        : { opacity: 0, scale: 1.018 }
                    }
                    animate={{ opacity: 1, scale: 1 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.992 }
                    }
                    transition={
                      reduceMotion
                        ? { duration: 0.2 }
                        : plateTransition
                    }
                  >
                    <div className="perfume-hero__atmosphere-inner">
                      <Image
                        src={activeEditorialSrc}
                        alt=""
                        fill
                        sizes="100vw"
                        priority
                        quality={88}
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            ) : null}

            {/* Prefetch sibling plates so concentration swaps stay seamless */}
            {canSwapPlates ? (
              <div className="perfume-hero__preload" aria-hidden="true">
                {variantMembers.map((member) =>
                  member.editorialSrc &&
                  member.editorialSrc !== activeEditorialSrc ? (
                    <img
                      key={member.slug}
                      src={member.editorialSrc}
                      alt=""
                      decoding="async"
                    />
                  ) : null,
                )}
              </div>
            ) : null}

            <div className="perfume-hero__grain" aria-hidden="true" />
            <div className="perfume-hero__scrim" aria-hidden="true" />
            <div className="perfume-hero__doc-plane" aria-hidden="true">
              <span className="perfume-hero__doc-plane-edge" />
            </div>

            <motion.div
              className="perfume-hero__stage"
              variants={reduceMotion ? undefined : stageVariants}
              initial={reduceMotion ? false : "hidden"}
              animate={entered || reduceMotion ? "show" : "hidden"}
            >
              <motion.div
                className="perfume-hero__chapters-slot"
                variants={itemVariants}
              >
                <HeroChapterIndex current="01" />
              </motion.div>

              <motion.div
                className="perfume-hero__identity"
                variants={groupVariants}
              >
                <div className="perfume-hero__identity-inner">
                  {activeCatalogRef ? (
                    <motion.div
                      className="perfume-hero__catalog-slot"
                      variants={itemVariants}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span
                          key={`catalog-${copyKey}`}
                          className="perfume-hero__catalog"
                          initial={reduceMotion ? false : { opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={reduceMotion ? undefined : { opacity: 0 }}
                          transition={
                            reduceMotion
                              ? { duration: 0.15 }
                              : copyTransition
                          }
                        >
                          {activeCatalogRef}
                        </motion.span>
                      </AnimatePresence>
                    </motion.div>
                  ) : null}

                  {brandLogoSrc ? (
                    <motion.div variants={itemVariants}>
                      <Image
                        className="perfume-hero__brand"
                        src={brandLogoSrc}
                        alt={brandName}
                        width={160}
                        height={48}
                        priority
                      />
                    </motion.div>
                  ) : brandName ? (
                    <motion.span
                      className="perfume-hero__brand-fallback"
                      variants={itemVariants}
                    >
                      {brandName}
                    </motion.span>
                  ) : null}

                  <motion.h1
                    className="perfume-hero__name"
                    data-stacked={titleLines.length > 1 ? "true" : "false"}
                    variants={itemVariants}
                  >
                    {titleLines.map((line) => (
                      <span key={line} className="perfume-hero__name-line">
                        {line}
                      </span>
                    ))}
                  </motion.h1>

                  <motion.div
                    className="perfume-hero__copy-slot"
                    variants={itemVariants}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={`copy-${copyKey}`}
                        initial={reduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduceMotion ? undefined : { opacity: 0 }}
                        transition={
                          reduceMotion
                            ? { duration: 0.15 }
                            : copyTransition
                        }
                      >
                        {activeDescriptor ? (
                          <p className="perfume-hero__tagline">
                            {activeDescriptor}
                          </p>
                        ) : null}
                        <EditorialSentence>{activeSummary}</EditorialSentence>
                      </motion.div>
                    </AnimatePresence>
                  </motion.div>

                  <motion.p
                    className="perfume-hero__scroll-cue"
                    variants={itemVariants}
                    aria-hidden="true"
                  >
                    Scroll
                  </motion.p>
                </div>
              </motion.div>

              {showBottle && bottleSrc ? (
                <div className="perfume-hero__sculpture">
                  <div className="perfume-hero__bottle">
                    <div className="perfume-hero__bottle-inner">
                      <Image
                        src={bottleSrc}
                        alt={`${heroName} — frasco`}
                        width={900}
                        height={1350}
                        priority
                        quality={85}
                        sizes="(max-width: 640px) 48vw, 42vh"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="perfume-hero__stage-spacer" aria-hidden="true" />
              )}

              {hasMetaRail || variantMembers.length ? (
                <motion.aside
                  className="hero-rail"
                  variants={itemVariants}
                  aria-label="Ficha técnica"
                >
                  <HeroVariantSelector
                    members={variantMembers}
                    concentration={
                      activeMember?.concentration ?? concentration
                    }
                    selectedSlug={selectedSlug}
                    onSelect={
                      canSwapPlates
                        ? (member) => setSelectedSlug(member.slug)
                        : undefined
                    }
                    placement="rail"
                  />

                  <div className="hero-rail__meta-slot">
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.dl
                        key={`meta-${copyKey}`}
                        className="hero-rail__meta"
                        initial={reduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduceMotion ? undefined : { opacity: 0 }}
                        transition={
                          reduceMotion
                            ? { duration: 0.15 }
                            : copyTransition
                        }
                      >
                        {activePerfumer ? (
                          <div className="hero-rail__row">
                            <dt>Perfumer</dt>
                            <dd>{activePerfumer}</dd>
                          </div>
                        ) : null}
                        {activeYear != null ? (
                          <div className="hero-rail__row">
                            <dt>Año</dt>
                            <dd>{activeYear}</dd>
                          </div>
                        ) : null}
                        {activeFamily ? (
                          <div className="hero-rail__row">
                            <dt>Familia olfativa</dt>
                            <dd>{activeFamily}</dd>
                          </div>
                        ) : null}
                        {origin ? (
                          <div className="hero-rail__row">
                            <dt>Origen</dt>
                            <dd>{origin}</dd>
                          </div>
                        ) : null}
                      </motion.dl>
                    </AnimatePresence>
                  </div>
                </motion.aside>
              ) : null}
            </motion.div>
          </div>
        </section>
      )}
    </HeroTransition>
  );
}
