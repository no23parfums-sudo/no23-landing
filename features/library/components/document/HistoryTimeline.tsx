"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { HistoryPresentation } from "../../lib/presentation";

type HistoryTimelineProps = {
  history?: HistoryPresentation;
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
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

/**
 * Line history — factual timeline. Desktop: horizontal; mobile: stack.
 */
export function HistoryTimeline({ history }: HistoryTimelineProps) {
  const { ref, visible } = useReveal();
  if (!history?.events?.length) return null;

  const { eyebrow, title, lede, events } = history;

  return (
    <section
      ref={ref}
      className="archive-section history-timeline"
      aria-labelledby="history-title"
      data-visible={visible ? "true" : "false"}
    >
      <header className="history-timeline__masthead">
        {eyebrow ? (
          <span className="history-timeline__eyebrow">{eyebrow}</span>
        ) : null}
        <h2 id="history-title" className="history-timeline__title">
          {title}
        </h2>
        {lede ? <p className="history-timeline__lede">{lede}</p> : null}
      </header>

      <ol className="history-timeline__track">
        {events.map((event, index) => {
          const inner = (
            <>
              <span className="history-timeline__year">{event.year}</span>
              <span className="history-timeline__node" aria-hidden="true" />
              <div className="history-timeline__card">
                {event.imageSrc ? (
                  <div className="history-timeline__media">
                    <Image
                      src={event.imageSrc}
                      alt=""
                      width={120}
                      height={160}
                      className="history-timeline__image"
                    />
                  </div>
                ) : null}
                <h3 className="history-timeline__label">{event.label}</h3>
                <p className="history-timeline__body">{event.body}</p>
              </div>
            </>
          );

          return (
            <li
              key={event.id}
              className="history-timeline__event"
              style={{ ["--hist-i" as string]: String(index) }}
            >
              {event.href ? (
                <Link href={event.href} className="history-timeline__link">
                  {inner}
                </Link>
              ) : (
                <div className="history-timeline__static">{inner}</div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
