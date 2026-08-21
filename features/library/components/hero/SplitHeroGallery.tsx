"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useRef, useState } from "react";
import type {
  CollectionMember,
  PerfumePresentation,
} from "../../lib/presentation";
import { HeroTransition } from "./HeroTransition";
import { HeroVariantSelector } from "./HeroVariantSelector";
import { PerfumeActions } from "../document/PerfumeActions";
import { RatingSummary } from "../document/RatingSummary";
import { resolveReviews, type ReviewsData } from "../../lib/reviews";

type SplitHeroGalleryProps = {
  presentation: PerfumePresentation;
  concentration?: string | null;
  year?: number | null;
  activeSlug?: string | null;
  onActiveSlugChange?: (slug: string) => void;
};

/** Official Chanel EDP packshot — original AVIF, unmodified. */
const PRODUCT_BOTTLE =
  "/media/perfumes/bleu-de-chanel-edp/edp/bleu-edp-hero-official.avif";
const PRODUCT_BOTTLE_W = 1364;
const PRODUCT_BOTTLE_H = 1364;

const easeOut = [0.22, 1, 0.36, 1] as const;

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
 * Split Hero — product portrait / editorial archive.
 * Real bottle at center; NO.23 interface on left and right.
 */
export function SplitHeroGallery({
  presentation,
  concentration,
  year,
  activeSlug,
  onActiveSlugChange,
}: SplitHeroGalleryProps) {
  const {
    heroName,
    heroTitleLines,
    brandName,
    catalogRef,
    origin,
    variants,
    collection,
    olfactiveFamily,
    perfumer,
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

  const titleLines =
    heroTitleLines?.filter(Boolean) ??
    (heroName ? [heroName] : []);
  const activeDescriptor =
    activeMember?.descriptor ?? presentation.heroTagline ?? null;
  const activeSummary =
    activeMember?.editorialSummary ?? presentation.archivalCaption ?? null;
  const activePerfumer = activeMember?.perfumer ?? perfumer?.name ?? null;
  const activeYear =
    activeMember?.year ?? year ?? presentation.yearFallback ?? null;
  const activeFamily =
    activeMember?.olfactiveFamily ?? olfactiveFamily ?? null;
  const activeCatalogRef = activeMember?.catalogRef ?? catalogRef ?? null;
  const activeConcentration =
    activeMember?.concentration ?? concentration ?? null;

  return (
    <HeroTransition
      hasChapterReveal={false}
      hasFirmaFilm={false}
      layout="split"
    >
      {({ pinRef }) => (
        <section
          ref={pinRef}
          className="perfume-hero-scroll"
          aria-label={`${heroName} — retrato de producto`}
        >
          <SplitHeroStage
            heroName={heroName}
            titleLines={titleLines}
            brandName={brandName}
            activeCatalogRef={activeCatalogRef}
            activeConcentration={activeConcentration}
            activeDescriptor={activeDescriptor}
            activeSummary={activeSummary}
            activePerfumer={activePerfumer}
            activeYear={activeYear}
            activeFamily={activeFamily}
            origin={origin}
            collectionTitle={presentation.collection?.title ?? null}
            reviews={presentation.reviews}
            variantMembers={variantMembers}
            selectedSlug={selectedSlug}
            onSelect={setSelectedSlug}
          />
        </section>
      )}
    </HeroTransition>
  );
}

type StageProps = {
  heroName: string;
  titleLines: string[];
  brandName?: string | null;
  activeCatalogRef?: string | null;
  activeConcentration?: string | null;
  activeDescriptor?: string | null;
  activeSummary?: string | null;
  activePerfumer?: string | null;
  activeYear?: number | null;
  activeFamily?: string | null;
  origin?: string | null;
  collectionTitle?: string | null;
  reviews?: ReviewsData | null;
  variantMembers: CollectionMember[];
  selectedSlug: string | null;
  onSelect: (slug: string) => void;
};

function SplitHeroStage({
  heroName,
  titleLines,
  brandName,
  activeCatalogRef,
  activeConcentration,
  activeDescriptor,
  activeSummary,
  activePerfumer,
  activeYear,
  activeFamily,
  origin,
  collectionTitle,
  reviews,
  variantMembers,
  selectedSlug,
  onSelect,
}: StageProps) {
  const reduceMotion = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ["start start", "end start"],
  });
  const productY = useTransform(scrollYProgress, [0, 1], [0, -10]);
  const productScale = useTransform(scrollYProgress, [0, 1], [1, 0.985]);
  const community = resolveReviews(reviews);

  const reveal = reduceMotion
    ? false
    : { opacity: 0, y: 12 };
  const shown = { opacity: 1, y: 0 };

  return (
    <div
      ref={stageRef}
      className="perfume-hero perfume-hero--portrait"
      data-entered="true"
    >
      <div className="hero-portrait">
        <motion.div
          className="hero-portrait__left"
          initial={reveal}
          animate={shown}
          transition={{ duration: 0.82, ease: easeOut, delay: 0.14 }}
        >
          <div className="hero-portrait__identity">
            {brandName ? (
              <p className="hero-portrait__maison">{brandName}</p>
            ) : null}
            {activeCatalogRef ? (
              <p className="hero-portrait__eyebrow">{activeCatalogRef}</p>
            ) : null}
            {titleLines.length ? (
              <h1 className="hero-portrait__title">
                {titleLines.map((line) => (
                  <span key={line} className="hero-portrait__title-line">
                    {line}
                  </span>
                ))}
              </h1>
            ) : null}
            <div className="hero-portrait__edition">
              {activeConcentration ? (
                <p className="hero-portrait__concentration">
                  {activeConcentration}
                </p>
              ) : null}
              {activeDescriptor ? (
                <p className="hero-portrait__family">{activeDescriptor}</p>
              ) : null}
            </div>
          </div>
          <div className="hero-portrait__reading">
            {activeSummary ? (
              <p className="hero-portrait__lede">{activeSummary}</p>
            ) : null}
            <RatingSummary
              rating={community.rating}
              reviewCount={community.reviewCount}
            />
            <PerfumeActions
              layout="editorial"
              perfumeName={heroName}
            />
          </div>
        </motion.div>

        <motion.figure
          className="hero-portrait__product"
          initial={reveal}
          animate={shown}
          transition={{ duration: 0.88, ease: easeOut, delay: 0 }}
          style={
            reduceMotion
              ? undefined
              : { y: productY, scale: productScale }
          }
        >
          <div className="hero-portrait__object">
            <Image
              className="hero-portrait__bottle"
              src={PRODUCT_BOTTLE}
              alt={`${heroName} Eau de Parfum`}
              width={PRODUCT_BOTTLE_W}
              height={PRODUCT_BOTTLE_H}
              sizes="(max-width: 900px) 78vw, 48vw"
              priority
              quality={100}
              unoptimized
            />
          </div>
        </motion.figure>

        <motion.div
          className="hero-portrait__right"
          initial={reveal}
          animate={shown}
          transition={{ duration: 0.82, ease: easeOut, delay: 0.26 }}
        >
          <HeroVariantSelector
            members={variantMembers}
            concentration={activeConcentration}
            collectionTitle={collectionTitle}
            selectedSlug={selectedSlug}
            onSelect={(member) => onSelect(member.slug)}
            placement="rail"
          />

          <dl className="hero-portrait__meta">
            {activePerfumer ? (
              <div className="hero-portrait__field">
                <dt>Perfumista</dt>
                <dd>{activePerfumer}</dd>
              </div>
            ) : null}
            {activeYear != null ? (
              <div className="hero-portrait__field hero-portrait__field--metric">
                <dt>Año</dt>
                <dd>{activeYear}</dd>
              </div>
            ) : null}
            {activeFamily ? (
              <div className="hero-portrait__field">
                <dt>Familia olfativa</dt>
                <dd>{activeFamily}</dd>
              </div>
            ) : null}
            {origin ? (
              <div className="hero-portrait__field">
                <dt>Origen</dt>
                <dd>{origin}</dd>
              </div>
            ) : null}
          </dl>
        </motion.div>
      </div>
    </div>
  );
}
