"use client";

import Image from "next/image";
import type { PerfumePresentation } from "../../lib/presentation";
import { EditorialSentence } from "./EditorialSentence";
import { HeroTransition } from "./HeroTransition";
import { HeroVariantSelector } from "./HeroVariantSelector";
import { PerfumerSignature } from "./PerfumerSignature";

export type PerfumeHeroProps = {
  presentation: PerfumePresentation;
  concentration?: string | null;
  year?: number | null;
  commercialStatus?: string | null;
};

/**
 * Editorial perfume opening.
 * Typography leads. Photograph is the stage.
 * Bottle PNG is fallback only when no editorial image exists.
 */
export function PerfumeHero({
  presentation,
  concentration,
  year,
  commercialStatus,
}: PerfumeHeroProps) {
  const {
    atmosphere,
    brandName,
    brandLogoSrc,
    heroName,
    heroTitleLines,
    editorialSrc,
    bottleSrc,
    archivalCaption,
    perfumer,
    variants,
    collection,
  } = presentation;

  const hasEditorial = Boolean(editorialSrc);
  const showBottle = Boolean(bottleSrc) && !hasEditorial;
  const variantMembers = variants ?? collection?.members;
  const titleLines =
    heroTitleLines?.filter(Boolean).length
      ? heroTitleLines.filter(Boolean)
      : [heroName];

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
            {editorialSrc ? (
              <div className="perfume-hero__atmosphere" aria-hidden="true">
                <div className="perfume-hero__atmosphere-inner">
                  <Image
                    src={editorialSrc}
                    alt=""
                    fill
                    sizes="(max-width: 980px) 100vw, 70vw"
                    priority
                    quality={88}
                  />
                </div>
              </div>
            ) : null}

            <div className="perfume-hero__grain" aria-hidden="true" />
            <div className="perfume-hero__scrim" aria-hidden="true" />
            <div className="perfume-hero__veil" aria-hidden="true" />

            <div className="perfume-hero__stage">
              <div className="perfume-hero__identity">
                <div className="perfume-hero__identity-inner">
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
                    data-stacked={titleLines.length > 1 ? "true" : "false"}
                  >
                    {titleLines.map((line) => (
                      <span key={line} className="perfume-hero__name-line">
                        {line}
                      </span>
                    ))}
                  </h1>

                  <HeroVariantSelector
                    members={variantMembers}
                    concentration={concentration}
                  />

                  <EditorialSentence>{archivalCaption}</EditorialSentence>

                  <PerfumerSignature
                    perfumer={perfumer}
                    year={year}
                    commercialStatus={commercialStatus}
                  />
                </div>
              </div>

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
              ) : null}
            </div>
          </div>
        </section>
      )}
    </HeroTransition>
  );
}
