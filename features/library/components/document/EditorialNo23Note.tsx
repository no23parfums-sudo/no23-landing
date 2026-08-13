"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

const TITLE = "Lectura Editorial NO.23";

const BODY =
  "Los indicadores de performance expresan una interpretación cualitativa del comportamiento de la fragancia, elaborada a partir de fuentes especializadas, consenso de comunidad y criterio editorial. La experiencia puede variar según piel, aplicación, clima y entorno.";

const FOOTER = "Fuentes · Editorial · Comunidad";

/** Small delay so the pointer can cross the pill → popover gap without flicker. */
const HOVER_CLOSE_MS = 120;

type EditorialNo23NoteProps = {
  /** Performance immersive chapter — pill + floating popover */
  variant?: "performance" | "inline";
};

function isFineHoverPointer(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

/**
 * Editorial methodology cue — qualitative, not instrumental.
 *
 * Desktop: hover region (pill + popover) opens/closes — no click latch.
 * Keyboard: focus open, blur/Escape close.
 * Mobile / coarse: tap toggle.
 */
export function EditorialNo23Note({
  variant = "performance",
}: EditorialNo23NoteProps) {
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeTimerRef = useRef<number | null>(null);
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const clearCloseTimer = () => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openNow = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const scheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, HOVER_CLOSE_MS);
  };

  useEffect(() => () => clearCloseTimer(), []);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent | TouchEvent) => {
      if (!isFineHoverPointer()) {
        const root = rootRef.current;
        if (!root) return;
        if (event.target instanceof Node && !root.contains(event.target)) {
          setOpen(false);
        }
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("touchstart", onPointer, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("touchstart", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isPerformance = variant === "performance";

  return (
    <div
      ref={rootRef}
      className={`editorial-no23${isPerformance ? " editorial-no23--performance" : ""}`}
      data-open={open ? "true" : "false"}
      data-reduce-motion={reduceMotion ? "true" : "false"}
      onMouseEnter={() => {
        if (isFineHoverPointer()) openNow();
      }}
      onMouseLeave={() => {
        if (isFineHoverPointer()) scheduleClose();
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        className="editorial-no23__pill"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={(event) => {
          /* Desktop hover owns open/close — click must not latch. */
          if (isFineHoverPointer()) {
            event.preventDefault();
            openNow();
            return;
          }
          setOpen((v) => !v);
        }}
        onFocus={() => openNow()}
        onBlur={(event) => {
          const next = event.relatedTarget;
          if (next instanceof Node && rootRef.current?.contains(next)) return;
          clearCloseTimer();
          setOpen(false);
        }}
      >
        <span className="editorial-no23__label">Editorial NO.23</span>
        <span className="editorial-no23__mark" aria-hidden="true">
          ⓘ
        </span>
      </button>
      <div
        id={panelId}
        className="editorial-no23__popover"
        role="dialog"
        aria-labelledby={`${panelId}-title`}
        hidden={!open}
        tabIndex={-1}
      >
        <p id={`${panelId}-title`} className="editorial-no23__title">
          {TITLE}
        </p>
        <p className="editorial-no23__body">{BODY}</p>
        <p className="editorial-no23__footer">{FOOTER}</p>
      </div>
    </div>
  );
}
