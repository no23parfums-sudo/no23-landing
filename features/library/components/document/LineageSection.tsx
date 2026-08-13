"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { LineagePresentation } from "../../lib/presentation";

type LineageSectionProps = {
  lineage?: LineagePresentation;
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

/**
 * 06 / LA LÍNEA — chronological family catalogue.
 * Ivory editorial release after dark Performance. Not ecommerce cards.
 */
export function LineageSection({ lineage }: LineageSectionProps) {
  const { ref, visible } = useReveal();
  if (!lineage?.entries?.length) return null;

  const {
    index = "06",
    eyebrow = "LA LÍNEA",
    title,
    subtitle,
    entries,
  } = lineage;

  return (
    <section
      ref={ref}
      className="lineage-section"
      aria-labelledby="lineage-title"
      data-visible={visible ? "true" : "false"}
    >
      <header className="lineage-section__masthead">
        <p className="lineage-section__chapter">
          <span>{index}</span>
          <span className="lineage-section__chapter-rule" aria-hidden="true">
            /
          </span>
          <span>{eyebrow}</span>
        </p>
        <h2 id="lineage-title" className="lineage-section__title">
          {title}
        </h2>
        {subtitle ? (
          <p className="lineage-section__subtitle">{subtitle}</p>
        ) : null}
      </header>

      <div className="lineage-section__rule" aria-hidden="true" />

      <ol className="lineage-section__grid">
        {entries.map((entry, i) => {
          const body = (
            <>
              <p className="lineage-section__year">{entry.year}</p>
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
                <p className="lineage-section__concentration">
                  {entry.concentration}
                </p>
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
                <p className="lineage-section__reading">{entry.reading}</p>
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
    </section>
  );
}
