"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { NoteEntry } from "../../lib/presentation";

type NoteCardProps = {
  note: NoteEntry;
  /** Large editorial plate for Identidad olfativa */
  variant?: "default" | "hero";
  /** Quiet museum line under the note name */
  editorialLine?: string;
};

/**
 * Editorial note plate — photography first; tonal field when media is absent.
 */
export function NoteCard({
  note,
  variant = "default",
  editorialLine,
}: NoteCardProps) {
  const initial = note.name.trim().charAt(0).toUpperCase();
  const rootRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
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
      { threshold: 0.12, rootMargin: "12% 0px -4% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <figure
      ref={rootRef}
      className={
        variant === "hero" ? "note-card note-card--hero" : "note-card"
      }
      data-visible={visible ? "true" : "false"}
    >
      <div
        className="note-card__media"
        data-has-image={note.imageSrc ? "true" : "false"}
      >
        {note.imageSrc ? (
          <Image
            src={note.imageSrc}
            alt=""
            fill
            sizes={
              variant === "hero"
                ? "(max-width: 900px) 92vw, 380px"
                : "(max-width: 900px) 28vw, 220px"
            }
            className="note-card__image"
            quality={88}
          />
        ) : (
          <span className="note-card__plate" aria-hidden="true">
            <span className="note-card__initial">{initial}</span>
          </span>
        )}
        <span className="note-card__grade" aria-hidden="true" />
        <span className="note-card__vignette" aria-hidden="true" />
      </div>
      <figcaption className="note-card__caption">
        <span className="note-card__name">{note.name}</span>
        {editorialLine ? (
          <span className="note-card__line">{editorialLine}</span>
        ) : null}
      </figcaption>
    </figure>
  );
}
