"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState, type Ref } from "react";
import type {
  CommercePresentation,
  CriterionReading,
  RelatedEntityPresentation,
  RelationsPresentation,
} from "../../lib/presentation";
import { No23Guidance } from "./No23Guidance";
import { copyAssemble, lineageViewport } from "./sceneHandoff";

type PerfumeRelationsSectionProps = {
  relations?: RelationsPresentation | null;
  /** Perfume-level editorial criteria — rendered as NO.23 Guidance under lineage. */
  guidance?: {
    easeOfUse?: CriterionReading;
    blindBuy?: CriterionReading;
  } | null;
  perfumeName?: string;
  concentration?: string;
  commerce?: CommercePresentation;
  relatedEntities?: RelatedEntityPresentation[];
  /** Split master template — Performance → Línea Bleu handoff. */
  layout?: "current" | "split";
};

function useReveal() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

function defaultsForMode(mode: RelationsPresentation["mode"]) {
  if (mode === "maison") {
    return {
      index: "06",
      eyebrow: "LA MAISON",
    };
  }
  return {
    index: "06",
    eyebrow: "LA LÍNEA",
  };
}

/**
 * Section 06 — relational / continued discovery.
 * Modes:
 * - lineage: chronological family (Bleu visual language preserved)
 * - maison: curated maison discoveries when no meaningful line exists
 * Renders nothing when relations is null/empty — never placeholders.
 */
export function PerfumeRelationsSection({
  relations,
  guidance,
  perfumeName,
  concentration,
  commerce,
  relatedEntities,
  layout = "current",
}: PerfumeRelationsSectionProps) {
  if (!relations?.entries?.length) return null;

  if (layout === "split") {
    return (
      <SplitRelationsSection
        relations={relations}
        guidance={guidance}
        perfumeName={perfumeName}
        concentration={concentration}
        commerce={commerce}
        relatedEntities={relatedEntities}
      />
    );
  }

  return (
    <FlowRelationsSection
      relations={relations}
      guidance={guidance}
      perfumeName={perfumeName}
      concentration={concentration}
      commerce={commerce}
      relatedEntities={relatedEntities}
    />
  );
}

type LoadedRelations = NonNullable<PerfumeRelationsSectionProps["relations"]>;

type RelationsBodyProps = Omit<PerfumeRelationsSectionProps, "layout" | "relations"> & {
  relations: LoadedRelations;
};

function FlowRelationsSection({
  relations,
  guidance,
  perfumeName,
  concentration,
  commerce,
  relatedEntities,
}: RelationsBodyProps) {
  const { ref, visible } = useReveal();
  return (
    <RelationsMarkup
      sectionRef={ref}
      visible={visible}
      relations={relations}
      guidance={guidance}
      perfumeName={perfumeName}
      concentration={concentration}
      commerce={commerce}
      relatedEntities={relatedEntities}
    />
  );
}

function SplitRelationsSection({
  relations,
  guidance,
  perfumeName,
  concentration,
  commerce,
  relatedEntities,
}: RelationsBodyProps) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = Boolean(useReducedMotion());
  const inView = useInView(ref, lineageViewport);
  const play = reduceMotion || inView;

  return (
    <RelationsMarkup
      sectionRef={ref}
      visible={play}
      animateEnter={!reduceMotion}
      play={play}
      relations={relations}
      guidance={guidance}
      perfumeName={perfumeName}
      concentration={concentration}
      commerce={commerce}
      relatedEntities={relatedEntities}
    />
  );
}

function RelationsMarkup({
  sectionRef,
  visible,
  play = true,
  animateEnter = false,
  relations,
  guidance,
  perfumeName,
  concentration,
  commerce,
  relatedEntities,
}: RelationsBodyProps & {
  sectionRef: Ref<HTMLElement>;
  visible: boolean;
  play?: boolean;
  animateEnter?: boolean;
}) {
  const mode = relations.mode ?? "lineage";
  const defaults = defaultsForMode(mode);
  const {
    index = defaults.index,
    eyebrow = defaults.eyebrow,
    title,
    subtitle,
    entries,
  } = relations;

  const hasGuidance = Boolean(
    guidance?.easeOfUse || guidance?.blindBuy,
  );

  return (
    <section
      ref={sectionRef}
      className={`perfume-relations lineage-section lineage-section--${mode}`}
      aria-labelledby="relations-title"
      data-mode={mode}
      data-visible={visible ? "true" : "false"}
      data-has-guidance={hasGuidance ? "true" : "false"}
    >
      <header className="lineage-section__masthead">
        <motion.p
          className="lineage-section__chapter"
          initial={animateEnter ? "hidden" : false}
          animate={play ? "show" : "hidden"}
          variants={animateEnter ? copyAssemble(0.04, 8) : undefined}
        >
          <span>{index}</span>
          <span className="lineage-section__chapter-rule" aria-hidden="true">
            /
          </span>
          <span>{eyebrow}</span>
        </motion.p>
        <motion.h2
          id="relations-title"
          className="lineage-section__title"
          initial={animateEnter ? "hidden" : false}
          animate={play ? "show" : "hidden"}
          variants={animateEnter ? copyAssemble(0, 10) : undefined}
        >
          {title}
        </motion.h2>
        {subtitle ? (
          <motion.p
            className="lineage-section__subtitle"
            initial={animateEnter ? "hidden" : false}
            animate={play ? "show" : "hidden"}
            variants={animateEnter ? copyAssemble(0.1, 8) : undefined}
          >
            {subtitle}
          </motion.p>
        ) : null}
      </header>

      <div className="lineage-section__rule" aria-hidden="true" />

      <ol className="lineage-section__grid">
        {entries.map((entry, i) => {
          const body = (
            <>
              {entry.year != null && entry.year !== "" ? (
                <p className="lineage-section__year">{entry.year}</p>
              ) : null}
              <div className="lineage-section__media">
                <Image
                  src={entry.imageSrc}
                  alt=""
                  width={320}
                  height={480}
                  className="lineage-section__image"
                  sizes="(max-width: 700px) 55vw, (max-width: 1100px) 28vw, 18vw"
                  loading={i < 2 ? "eager" : "lazy"}
                />
              </div>
              <div className="lineage-section__meta">
                {entry.concentration ? (
                  <p className="lineage-section__concentration">
                    {entry.concentration}
                  </p>
                ) : (
                  <p className="lineage-section__concentration">{entry.name}</p>
                )}
                {entry.current ? (
                  <p className="lineage-section__current">Estás aquí</p>
                ) : null}
                {entry.current && entry.perfumer ? (
                  <p className="lineage-section__perfumer">
                    {entry.perfumerPortraitSrc ? (
                      <span className="lineage-section__perfumer-portrait">
                        <Image
                          src={entry.perfumerPortraitSrc}
                          alt=""
                          width={28}
                          height={28}
                        />
                      </span>
                    ) : null}
                    <span>{entry.perfumer}</span>
                  </p>
                ) : null}
                {entry.reading ? (
                  <p className="lineage-section__reading">{entry.reading}</p>
                ) : null}
              </div>
            </>
          );

          const className = `lineage-section__entry${
            entry.current ? " lineage-section__entry--current" : ""
          }`;

          return (
            <li
              key={entry.id}
              className={className}
              style={{ ["--lineage-i" as string]: String(i) }}
            >
              {entry.href && !entry.current ? (
                <Link href={entry.href} className="lineage-section__link">
                  {body}
                </Link>
              ) : (
                <div className="lineage-section__static">{body}</div>
              )}
            </li>
          );
        })}
      </ol>

      {hasGuidance ? (
        <No23Guidance
          easeOfUse={guidance?.easeOfUse}
          blindBuy={guidance?.blindBuy}
          perfumeName={perfumeName}
          concentration={concentration}
          commerce={commerce}
          relatedEntities={relatedEntities}
        />
      ) : null}
    </section>
  );
}

/** @deprecated Prefer PerfumeRelationsSection */
export const LineageSection = PerfumeRelationsSection;
