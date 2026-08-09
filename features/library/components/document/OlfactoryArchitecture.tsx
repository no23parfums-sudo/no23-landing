"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  getArchitecture,
  type NoteStage,
  type PerfumePresentation,
  type SignatureNote,
} from "../../lib/presentation";

type OlfactoryArchitectureProps = {
  presentation: PerfumePresentation;
};

function useReveal(threshold = 0.15) {
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
      { threshold, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, visible };
}

function resolveLayerImage(
  stage: NoteStage,
  signatureNotes?: SignatureNote[],
): string | undefined {
  const fromStage = stage.notes.find((n) => n.imageSrc)?.imageSrc;
  if (fromStage) return fromStage;
  return signatureNotes?.find((s) => s.stage === stage.id)?.note.imageSrc;
}

function MaterialStack({
  stages,
  signatureNotes,
  visible,
}: {
  stages: NoteStage[];
  signatureNotes?: SignatureNote[];
  visible: boolean;
}) {
  return (
    <div
      className="arch-stack"
      data-visible={visible ? "true" : "false"}
      aria-hidden="true"
    >
      <div className="arch-stack__plinth" />
      {[...stages].reverse().map((stage, reverseIndex) => {
        const index = stages.length - 1 - reverseIndex;
        const src = resolveLayerImage(stage, signatureNotes);
        const featured = stage.notes[0]?.name;
        if (!src) return null;

        return (
          <figure
            key={stage.id}
            className="arch-stack__layer"
            data-stage={stage.id}
            data-index={index + 1}
            style={{ "--layer-i": index } as CSSProperties}
          >
            <div className="arch-stack__pane">
              <Image
                src={src}
                alt=""
                fill
                sizes="(max-width: 900px) 80vw, 420px"
                className="arch-stack__image"
                quality={75}
              />
              <span className="arch-stack__grade" />
              <span className="arch-stack__glass" />
            </div>
            {featured ? (
              <figcaption className="arch-stack__tag">{featured}</figcaption>
            ) : null}
          </figure>
        );
      })}
    </div>
  );
}

/**
 * Arquitectura olfativa — immersive material study.
 * Photography leads; geometry only supports. Data-driven strata.
 */
export function OlfactoryArchitecture({
  presentation,
}: OlfactoryArchitectureProps) {
  const architecture = getArchitecture(presentation);
  const stages = architecture?.stages?.filter((s) => s.notes.length) ?? [];
  const { ref, visible } = useReveal(0.12);

  if (!stages.length) return null;

  const eyebrow = architecture?.eyebrow ?? "Composición";
  const title = architecture?.title ?? "Arquitectura olfativa";
  const lede = architecture?.lede?.trim();
  const { perfumer, signatureNotes } = presentation;

  return (
    <section
      ref={ref}
      className="archive-section olfactory-architecture"
      aria-labelledby="architecture-title"
      data-visible={visible ? "true" : "false"}
    >
      <div className="olfactory-architecture__chamber">
        <div className="olfactory-architecture__inner">
          <header className="arch-intro">
            <span className="arch-intro__eyebrow">{eyebrow}</span>
            <h2 id="architecture-title" className="arch-intro__title">
              {title}
            </h2>
            {lede ? <p className="arch-intro__lede">{lede}</p> : null}

            {perfumer?.quote ? (
              <aside className="arch-insight">
                {perfumer.portraitSrc ? (
                  <div className="arch-insight__portrait">
                    <Image
                      src={perfumer.portraitSrc}
                      alt=""
                      width={72}
                      height={72}
                    />
                  </div>
                ) : null}
                <div className="arch-insight__body">
                  <p className="arch-insight__quote">“{perfumer.quote}”</p>
                  <p className="arch-insight__credit">{perfumer.name}</p>
                </div>
              </aside>
            ) : null}
          </header>

          <div className="arch-exhibit">
            <MaterialStack
              stages={stages}
              signatureNotes={signatureNotes}
              visible={visible}
            />

            <ol className="arch-rail">
              {stages.map((stage, index) => {
                const [featured, ...supporting] = stage.notes;
                if (!featured) return null;

                return (
                  <li
                    key={stage.id}
                    className="arch-rail__item"
                    data-stage={stage.id}
                    style={{ "--rail-i": index } as CSSProperties}
                  >
                    <span className="arch-rail__index" aria-hidden="true">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div className="arch-rail__copy">
                      <h3 className="arch-rail__label">{stage.label}</h3>
                      <p className="arch-rail__featured">{featured.name}</p>
                      {stage.reading ? (
                        <p className="arch-rail__reading">{stage.reading}</p>
                      ) : null}
                      {supporting.length ? (
                        <ul className="arch-rail__notes">
                          {supporting.map((note) => (
                            <li key={`${stage.id}-${note.name}`}>
                              {note.name}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
