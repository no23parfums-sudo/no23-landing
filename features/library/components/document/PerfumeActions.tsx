"use client";

import { useId, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { CommercePresentation } from "../../lib/presentation";
import {
  No23AuthGate,
  type AuthGateIntent,
} from "./No23AuthGate";

type PerfumeActionsProps = {
  perfumeName: string;
  concentration?: string;
  commerce?: CommercePresentation;
  /** Future auth wiring — default unauthenticated */
  isAuthenticated?: boolean;
  onAddToCollection?: () => void;
  onAddToWishlist?: () => void;
  /** embedded = Criterio column; editorial = Section 1 personal actions */
  layout?: "embedded" | "editorial";
};

function PlusMark() {
  return (
    <svg
      className="perfume-actions__plus-icon"
      viewBox="0 0 12 12"
      width="11"
      height="11"
      aria-hidden="true"
    >
      <path
        d="M6 1.25v9.5M1.25 6h9.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="square"
      />
    </svg>
  );
}

function StarMark() {
  return (
    <svg
      className="perfume-actions__star-icon"
      viewBox="0 0 24 24"
      width="11"
      height="11"
      aria-hidden="true"
    >
      <path
        d="M12 2.6l2.35 5.72 6.25.54-4.76 4.14 1.45 6.12L12 16.18 6.71 19.12l1.45-6.12-4.76-4.14 6.25-.54z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

/**
 * Product action block — Collection / Wishlist / conditional Shop.
 * `editorial` sits in the Section 1 reading column; `embedded` stays in Criterio.
 */
export function PerfumeActions({
  perfumeName,
  concentration,
  commerce,
  isAuthenticated = false,
  onAddToCollection,
  onAddToWishlist,
  layout = "embedded",
}: PerfumeActionsProps) {
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const [gateOpen, setGateOpen] = useState(false);
  const [gateIntent, setGateIntent] = useState<AuthGateIntent>("collection");

  const shopVisible = layout === "embedded" && commerce?.available === true;
  const shopUrl = commerce?.productUrl;
  const shopLabel = commerce?.label ?? "AVAILABLE IN NO.23 SHOP";

  const requestSave = (intent: AuthGateIntent) => {
    if (!isAuthenticated) {
      setGateIntent(intent);
      setGateOpen(true);
      return;
    }
    if (intent === "collection") onAddToCollection?.();
    else onAddToWishlist?.();
  };

  const buttons = (
    <div className="perfume-actions__controls">
      <button
        type="button"
        className="perfume-actions__btn perfume-actions__btn--primary"
        aria-label="Add to Collection"
        onClick={() => requestSave("collection")}
      >
        <span className="perfume-actions__icon" aria-hidden="true">
          <PlusMark />
        </span>
        <span className="perfume-actions__btn-label">
          Añadir a mi colección
        </span>
      </button>

      <button
        type="button"
        className="perfume-actions__btn perfume-actions__btn--ghost"
        onClick={() => requestSave("wishlist")}
        aria-label="Add to Wishlist"
      >
        <span className="perfume-actions__icon" aria-hidden="true">
          <StarMark />
        </span>
        <span className="perfume-actions__btn-label">
          Añadir a mi wishlist
        </span>
      </button>

      {shopVisible && shopUrl ? (
        <a
          className="perfume-actions__shop"
          href={shopUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span>{shopLabel}</span>
          <span className="perfume-actions__shop-arrow" aria-hidden="true">
            ↗
          </span>
        </a>
      ) : null}

      {shopVisible && !shopUrl ? (
        <button
          type="button"
          className="perfume-actions__shop perfume-actions__shop--status"
          aria-label={shopLabel}
        >
          <span>{shopLabel}</span>
          <span className="perfume-actions__shop-arrow" aria-hidden="true">
            ↗
          </span>
        </button>
      ) : null}
    </div>
  );

  return (
    <div
      className={`perfume-actions perfume-actions--${layout}`}
      aria-labelledby={layout === "embedded" ? `${baseId}-title` : undefined}
      aria-label={layout === "editorial" ? "Acciones del perfume" : undefined}
      data-reduce-motion={reduceMotion ? "true" : "false"}
    >
      {layout === "embedded" ? (
        <header className="perfume-actions__masthead">
          <h2 id={`${baseId}-title`} className="perfume-actions__title">
            {perfumeName}
          </h2>
          {concentration ? (
            <p className="perfume-actions__concentration">{concentration}</p>
          ) : null}
          <p className="perfume-actions__lede">
            Guardá esta fragancia en NO.23.
          </p>
        </header>
      ) : null}

      {buttons}

      <No23AuthGate
        open={gateOpen}
        intent={gateIntent}
        onClose={() => setGateOpen(false)}
      />
    </div>
  );
}
