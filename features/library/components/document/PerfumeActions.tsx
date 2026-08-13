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
};

/**
 * Final editorial action area — Collection / Wishlist / conditional Shop.
 * Unauthenticated: opens No23AuthGate. Authenticated: calls action hooks.
 */
export function PerfumeActions({
  perfumeName,
  concentration,
  commerce,
  isAuthenticated = false,
  onAddToCollection,
  onAddToWishlist,
}: PerfumeActionsProps) {
  const reduceMotion = useReducedMotion();
  const baseId = useId();
  const [gateOpen, setGateOpen] = useState(false);
  const [gateIntent, setGateIntent] = useState<AuthGateIntent>("collection");

  const shopVisible = commerce?.available === true;
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

  return (
    <section
      className="perfume-actions"
      aria-labelledby={`${baseId}-title`}
      data-reduce-motion={reduceMotion ? "true" : "false"}
    >
      <div className="perfume-actions__rule" aria-hidden="true" />

      <header className="perfume-actions__masthead">
        <p className="perfume-actions__eyebrow">TU NO.23</p>
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

      <div className="perfume-actions__controls">
        <button
          type="button"
          className="perfume-actions__btn perfume-actions__btn--primary"
          onClick={() => requestSave("collection")}
        >
          <span className="perfume-actions__btn-mark" aria-hidden="true">
            +
          </span>
          <span>Agregar a mi colección</span>
        </button>

        <button
          type="button"
          className="perfume-actions__btn perfume-actions__btn--ghost"
          onClick={() => requestSave("wishlist")}
        >
          <span>Agregar a wishlist</span>
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
          <span
            className="perfume-actions__shop perfume-actions__shop--status"
            role="status"
          >
            <span>{shopLabel}</span>
            <span className="perfume-actions__shop-arrow" aria-hidden="true">
              ↗
            </span>
          </span>
        ) : null}
      </div>

      <No23AuthGate
        open={gateOpen}
        intent={gateIntent}
        onClose={() => setGateOpen(false)}
      />
    </section>
  );
}
