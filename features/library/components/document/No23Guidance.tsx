"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import type {
  CommercePresentation,
  CriterionReading,
  RelatedEntityPresentation,
} from "../../lib/presentation";
import {
  criterioBarPosition,
  criterioExplanation,
  criterioVerdict,
  type CriterioKind,
} from "../../lib/criterioScoring";
import {
  hasCriterioSignatureBeenSeen,
  markCriterioSignatureSeen,
} from "../../lib/discoveryState";
import { PerfumeActions } from "./PerfumeActions";
import { RelatedEntityCard } from "./RelatedEntityCard";

type No23GuidanceProps = {
  easeOfUse?: CriterionReading;
  blindBuy?: CriterionReading;
  perfumeName?: string;
  concentration?: string;
  commerce?: CommercePresentation;
  relatedEntities?: RelatedEntityPresentation[];
};

const GUIDANCE_META = {
  easeOfUse: {
    id: "ease",
    kind: "easeOfUse" as CriterioKind,
    label: "Facilidad de uso",
    defaults: ["Difícil", "Fácil"] as [string, string],
    explanation: criterioExplanation("easeOfUse"),
  },
  blindBuy: {
    id: "blind",
    kind: "blindBuy" as CriterioKind,
    label: "Compra a ciegas",
    defaults: ["Arriesgada", "Segura"] as [string, string],
    explanation: criterioExplanation("blindBuy"),
  },
} as const;

const HOVER_CLOSE_MS = 120;

function isFineHoverPointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/** Authoritative 0–10 score; provisional fallback from position only. */
function resolveCriterionScore(reading: CriterionReading): string {
  if (typeof reading.score === "number" && Number.isFinite(reading.score)) {
    return reading.score.toFixed(1);
  }
  const n = Math.min(1, Math.max(0, reading.position ?? 0.7)) * 10;
  return n.toFixed(1);
}

function resolveCriterionVerdict(
  reading: CriterionReading,
  kind: CriterioKind,
): string {
  if (reading.verdict) return reading.verdict;
  if (typeof reading.score === "number" && Number.isFinite(reading.score)) {
    return criterioVerdict(kind, reading.score);
  }
  return reading.marker ?? reading.reading;
}

function resolveCriterionTarget(reading: CriterionReading): number {
  if (typeof reading.score === "number" && Number.isFinite(reading.score)) {
    return criterioBarPosition(reading.score);
  }
  if (typeof reading.position === "number" && Number.isFinite(reading.position)) {
    return Math.min(1, Math.max(0, reading.position));
  }
  return 0.7;
}

function No23SignatureMark() {
  return (
    <img
      className="no23-guidance__signature"
      src="/media/brands/no23/signature.png"
      alt=""
      width={1022}
      height={320}
      draggable={false}
    />
  );
}

/**
 * Final chapter — Criterio NO.23.
 * Editorial measurement + house certification + compact action module.
 */
export function No23Guidance({
  easeOfUse,
  blindBuy,
  perfumeName,
  concentration,
  commerce,
  relatedEntities,
}: No23GuidanceProps) {
  const rootRef = useRef<HTMLElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const reduced = useReducedMotion();
  const [signPhase, setSignPhase] = useState<
    "idle" | "enter" | "resolved"
  >(() =>
    reduced || hasCriterioSignatureBeenSeen() ? "resolved" : "idle",
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const easePanelId = useId();
  const blindPanelId = useId();

  const rows: {
    key: keyof typeof GUIDANCE_META;
    reading: CriterionReading;
    panelId: string;
  }[] = [];
  if (easeOfUse) {
    rows.push({ key: "easeOfUse", reading: easeOfUse, panelId: easePanelId });
  }
  if (blindBuy) {
    rows.push({ key: "blindBuy", reading: blindBuy, panelId: blindPanelId });
  }

  const clearCloseTimer = () => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openNow = (id: string) => {
    clearCloseTimer();
    setActiveId(id);
  };

  const scheduleClose = (id: string) => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setActiveId((cur) => (cur === id ? null : cur));
      closeTimerRef.current = null;
    }, HOVER_CLOSE_MS);
  };

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    if (reduced || hasCriterioSignatureBeenSeen()) {
      setSignPhase("resolved");
      if (reduced) markCriterioSignatureSeen();
      return;
    }
    const node = rootRef.current;
    if (!node || signPhase !== "idle") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setSignPhase("enter");
          observer.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduced, signPhase]);

  useEffect(() => {
    if (signPhase !== "enter") return;
    const id = window.setTimeout(() => {
      markCriterioSignatureSeen();
      setSignPhase("resolved");
    }, 680);
    return () => window.clearTimeout(id);
  }, [signPhase]);

  useEffect(() => {
    if (!activeId) return;
    const onPointer = (event: MouseEvent | TouchEvent) => {
      if (isFineHoverPointer()) return;
      const root = rootRef.current;
      if (!root) return;
      if (event.target instanceof Node && !root.contains(event.target)) {
        setActiveId(null);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActiveId(null);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [activeId]);

  if (!rows.length) return null;

  return (
    <aside
      ref={rootRef}
      className="no23-guidance"
      data-sign={signPhase}
      data-reduced={reduced ? "true" : "false"}
      aria-label="Criterio NO.23"
    >
      <div className="no23-guidance__board">
        <div className="no23-guidance__main">
        <ul className="no23-guidance__list" role="list">
          {rows.map(({ key, reading, panelId }, i) => {
            const meta = GUIDANCE_META[key];
            const poles = reading.poles ?? meta.defaults;
            const marker = resolveCriterionVerdict(reading, meta.kind);
            const target = resolveCriterionTarget(reading);
            const score = resolveCriterionScore(reading);
            const open = activeId === meta.id;
            const explanation = reading.explanation ?? meta.explanation;
            return (
              <li
                key={key}
                className="no23-guidance__item editorial-no23 editorial-no23--criterion"
                style={{ ["--guidance-i" as string]: String(i) }}
                data-open={open ? "true" : "false"}
                onMouseEnter={() => {
                  if (isFineHoverPointer()) openNow(meta.id);
                }}
                onMouseLeave={() => {
                  if (isFineHoverPointer()) scheduleClose(meta.id);
                }}
              >
                <button
                  type="button"
                  className="no23-guidance__hit"
                  aria-expanded={open}
                  aria-controls={panelId}
                  aria-haspopup="dialog"
                  onClick={(event) => {
                    if (isFineHoverPointer()) {
                      event.preventDefault();
                      openNow(meta.id);
                      return;
                    }
                    setActiveId((cur) => (cur === meta.id ? null : meta.id));
                  }}
                  onFocus={() => openNow(meta.id)}
                  onBlur={(event) => {
                    const next = event.relatedTarget;
                    if (
                      next instanceof Node &&
                      event.currentTarget.parentElement?.contains(next)
                    ) {
                      return;
                    }
                    clearCloseTimer();
                    setActiveId((cur) => (cur === meta.id ? null : cur));
                  }}
                >
                  <span className="no23-guidance__row-head">
                    <span className="no23-guidance__label">{meta.label}</span>
                    <span className="no23-guidance__score-block">
                      <span className="no23-guidance__score">{score}</span>
                      <span className="no23-guidance__verdict">{marker}</span>
                    </span>
                  </span>

                  <span
                    className="no23-guidance__meter"
                    role="img"
                    aria-label={`${meta.label}: ${score}, ${marker}. De ${poles[0]} a ${poles[1]}.`}
                    style={
                      {
                        ["--guidance-target" as string]: String(target),
                        ["--guidance-pct" as string]: `${(target * 100).toFixed(2)}%`,
                      } as CSSProperties
                    }
                  >
                    <span className="no23-guidance__track" aria-hidden="true">
                      <span className="no23-guidance__fill">
                        <span className="no23-guidance__tip" />
                        <span className="no23-guidance__shimmer" />
                      </span>
                    </span>
                    <span className="no23-guidance__poles">
                      <span>Baja</span>
                      <span>Alta</span>
                    </span>
                  </span>
                </button>
                <div
                  id={panelId}
                  className="editorial-no23__popover"
                  role="dialog"
                  aria-labelledby={`${panelId}-title`}
                  hidden={!open}
                >
                  <p id={`${panelId}-title`} className="editorial-no23__title">
                    {meta.label}
                  </p>
                  <p className="editorial-no23__body">{explanation}</p>
                  <p className="editorial-no23__footer">
                    Criterio editorial NO.23
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        {relatedEntities?.length ? (
          <div className="no23-guidance__related">
            {relatedEntities.map((entity) => (
              <RelatedEntityCard key={`${entity.type}-${entity.name}`} {...entity} />
            ))}
          </div>
        ) : null}
        </div>

        <div className="no23-guidance__divider" aria-hidden="true" />

        <div className="no23-guidance__aside">
          <div className="no23-guidance__seal">
            <p className="no23-guidance__seal-kicker">NO.23 Certified</p>
            <p className="no23-guidance__seal-line">Firma olfativa</p>
            <div className="no23-guidance__signature-frame">
              <No23SignatureMark />
            </div>
            <div className="no23-guidance__seal-end">
              <span className="no23-guidance__seal-rule" aria-hidden="true" />
              <p className="no23-guidance__seal-lab">NO.23 Laboratories</p>
              <span className="no23-guidance__seal-rule" aria-hidden="true" />
            </div>
          </div>

          {perfumeName ? (
            <div className="no23-guidance__actions">
              <PerfumeActions
                perfumeName={perfumeName}
                concentration={concentration}
                commerce={commerce}
              />
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
