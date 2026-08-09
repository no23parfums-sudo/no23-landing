"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { MoodboardPresentation } from "../../lib/presentation";

type MoodboardProps = {
  moodboard?: MoodboardPresentation;
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
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

/**
 * Inspiration collage — asymmetric plates + chromatic strip.
 * Roles drive layout; fragrance only supplies media/copy.
 */
export function Moodboard({ moodboard }: MoodboardProps) {
  const { ref, visible } = useReveal();
  if (!moodboard?.plates?.length) return null;

  const { eyebrow, title, lede, swatches, plates } = moodboard;

  return (
    <section
      ref={ref}
      className="archive-section moodboard"
      aria-labelledby="moodboard-title"
      data-visible={visible ? "true" : "false"}
    >
      <header className="moodboard__masthead">
        {eyebrow ? (
          <span className="moodboard__eyebrow">{eyebrow}</span>
        ) : null}
        <h2 id="moodboard-title" className="moodboard__title">
          {title}
        </h2>
        {lede ? <p className="moodboard__lede">{lede}</p> : null}
      </header>

      {swatches?.length ? (
        <ul className="moodboard__swatches" aria-label="Paleta">
          {swatches.map((swatch) => (
            <li key={swatch.id} className="moodboard__swatch">
              <span
                className="moodboard__chip"
                style={{ background: swatch.hex }}
                title={swatch.label ?? swatch.hex}
              />
              {swatch.label ? (
                <span className="moodboard__swatch-label">{swatch.label}</span>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="moodboard__collage">
        {plates.map((plate, index) => (
          <figure
            key={plate.id}
            className="moodboard__plate"
            data-role={plate.role}
            data-index={index + 1}
          >
            <div className="moodboard__media">
              <Image
                src={plate.imageSrc}
                alt=""
                fill
                sizes="(max-width: 900px) 90vw, 40vw"
                className="moodboard__image"
                style={
                  plate.focus ? { objectPosition: plate.focus } : undefined
                }
                quality={75}
              />
            </div>
            {plate.caption ? (
              <figcaption className="moodboard__caption">
                {plate.caption}
              </figcaption>
            ) : null}
          </figure>
        ))}
      </div>
    </section>
  );
}
