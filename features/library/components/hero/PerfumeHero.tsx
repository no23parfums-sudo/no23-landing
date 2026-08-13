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
  NotesChapterPresentation,
  PerfumePresentation,
} from "../../lib/presentation";
import { EditorialSentence } from "./EditorialSentence";
import { HeroChapterReveal } from "./HeroChapterReveal";
import { HeroFirmaFilm } from "./HeroFirmaFilm";
import { HeroTransition } from "./HeroTransition";
import { HeroVariantSelector } from "./HeroVariantSelector";

export type PerfumeHeroProps = {
  presentation: PerfumePresentation;
  concentration?: string | null;
  year?: number | null;
  commercialStatus?: string | null;
  /** Active concentration/record slug (family swap) */
  activeSlug?: string | null;
  onActiveSlugChange?: (slug: string) => void;
  /**
   * Chapter 02 intro for the ACTIVE record only.
   * Must not fall back to the page presentation when another concentration is selected.
   */
  notesChapter?: NotesChapterPresentation | null;
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

/** Left identity (catalog · mark · title · descriptor · copy) — readable with the plate */
const leftContentTransition = {
  duration: 0.45,
  ease: easeOut,
};

/** Right metadata rail — keeps the slower dissolve for now */
const metaTransition = {
  duration: 0.75,
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
  activeSlug,
  onActiveSlugChange,
  notesChapter = null,
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
  const [uncontrolledSlug, setUncontrolledSlug] = useState<string | null>(() =>
    resolveDefaultSlug(variantMembers, concentration),
  );
  const selectedSlug = activeSlug ?? uncontrolledSlug;
  const setSelectedSlug = (slug: string) => {
    onActiveSlugChange?.(slug);
    if (activeSlug === undefined) setUncontrolledSlug(slug);
  };

  const activeMember =
    variantMembers.find((member) => member.slug === selectedSlug) ??
    variantMembers.find((member) => member.current) ??
    null;

  const hasChapterReveal = Boolean(
    notesChapter &&
      (notesChapter.revealInHero || notesChapter.title || notesChapter.eyebrow),
  );

  const activeEditorialSrc =
    activeMember?.editorialSrc ?? editorialSrc ?? null;
  const activeFirmaFilmSrc = activeMember?.firmaFilmSrc ?? null;
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
    <HeroTransition
      hasChapterReveal={hasChapterReveal}
      hasFirmaFilm={Boolean(activeFirmaFilmSrc)}
    >
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
                      {activeFirmaFilmSrc ? (
                        <HeroFirmaFilm src={activeFirmaFilmSrc} />
                      ) : null}
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

            {/* Beat 2 — active-record Chapter 02 only (no cross-slug fallback) */}
            {hasChapterReveal ? (
              <div className="perfume-hero__chapter-reveal-slot">
                <HeroChapterReveal chapter={notesChapter} />
              </div>
            ) : null}

            <motion.div
              className="perfume-hero__stage"
              variants={reduceMotion ? undefined : stageVariants}
              initial={reduceMotion ? false : "hidden"}
              animate={entered || reduceMotion ? "show" : "hidden"}
            >
              {/*
                Chapter rail is page-fixed (PerfumeChapterRail) so 01→04
                persists through cream/dark document sections. Keep the
                grid slot for layout alignment only.
              */}
              <motion.div
                className="perfume-hero__chapters-slot perfume-hero__chapters-slot--spacer"
                variants={itemVariants}
                aria-hidden="true"
              />

              <motion.div
                className="perfume-hero__identity"
                variants={groupVariants}
              >
                <div className="perfume-hero__identity-inner">
                  <motion.div
                    className="perfume-hero__left-slot"
                    variants={itemVariants}
                  >
                    <AnimatePresence mode="sync" initial={false}>
                      <motion.div
                        key={`left-${copyKey}`}
                        className="perfume-hero__left-content"
                        initial={reduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduceMotion ? undefined : { opacity: 0 }}
                        transition={
                          reduceMotion
                            ? { duration: 0.15 }
                            : leftContentTransition
                        }
                      >
                        {activeCatalogRef ? (
                          <div className="perfume-hero__catalog-slot">
                            <span className="perfume-hero__catalog">
                              {activeCatalogRef}
                            </span>
                          </div>
                        ) : null}

                        {brandLogoSrc ? (
                          <Image
                            className="perfume-hero__brand"
                            src={brandLogoSrc}
                            alt={brandName}
                            width={160}
                            height={48}
                            priority
                          />
                        ) : brandName ? (
                          <span className="perfume-hero__brand-fallback">
                            {brandName}
                          </span>
                        ) : null}

                        <h1
                          className="perfume-hero__name"
                          data-stacked={
                            titleLines.length > 1 ? "true" : "false"
                          }
                        >
                          {titleLines.map((line) => (
                            <span
                              key={line}
                              className="perfume-hero__name-line"
                            >
                              {line}
                            </span>
                          ))}
                        </h1>

                        <div className="perfume-hero__copy-slot">
                          {activeDescriptor ? (
                            <p className="perfume-hero__tagline">
                              {activeDescriptor}
                            </p>
                          ) : null}
                          <EditorialSentence>
                            {activeSummary}
                          </EditorialSentence>
                        </div>
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
                <motion.div
                  className="perfume-hero__rail-slot"
                  variants={itemVariants}
                >
                  <aside className="hero-rail" aria-label="Ficha técnica">
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
                    <AnimatePresence mode="sync" initial={false}>
                      <motion.dl
                        key={`meta-${copyKey}`}
                        className="hero-rail__meta"
                        initial={reduceMotion ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduceMotion ? undefined : { opacity: 0 }}
                        transition={
                          reduceMotion
                            ? { duration: 0.15 }
                            : metaTransition
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
                  </aside>
                </motion.div>
              ) : null}
            </motion.div>
          </div>
        </section>
      )}
    </HeroTransition>
  );
}
