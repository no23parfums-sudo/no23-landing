"use client";

import { useEffect, useId, useRef } from "react";
import { useReducedMotion } from "motion/react";

export type AuthGateIntent = "collection" | "wishlist";

type No23AuthGateProps = {
  open: boolean;
  intent?: AuthGateIntent;
  onClose: () => void;
  /** Future route wiring — omit until auth pages exist */
  createAccountHref?: string;
  signInHref?: string;
  onCreateAccount?: () => void;
  onSignIn?: () => void;
};

const TITLE = "Guardá tus fragancias en NO.23";

const BODY =
  "Creá una cuenta o iniciá sesión para construir tu colección, guardar tu wishlist y volver a tus perfumes cuando quieras.";

/**
 * Unauthenticated entry for Collection / Wishlist.
 * No backend — UI gate only. Wire routes/callbacks later.
 */
export function No23AuthGate({
  open,
  intent = "collection",
  onClose,
  createAccountHref,
  signInHref,
  onCreateAccount,
  onSignIn,
}: No23AuthGateProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleCreate = () => {
    if (createAccountHref) return;
    onCreateAccount?.();
    /* TODO: wire auth create-account route when available */
  };

  const handleSignIn = () => {
    if (signInHref) return;
    onSignIn?.();
    /* TODO: wire auth sign-in route when available */
  };

  const intentLabel =
    intent === "wishlist" ? "Wishlist" : "Colección";

  return (
    <div
      className="no23-auth-gate"
      role="presentation"
      data-intent={intent}
      data-reduce-motion={reduceMotion ? "true" : "false"}
    >
      <button
        type="button"
        className="no23-auth-gate__backdrop"
        aria-label="Cerrar"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className="no23-auth-gate__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          ref={closeRef}
          type="button"
          className="no23-auth-gate__close"
          aria-label="Cerrar"
          onClick={onClose}
        >
          ×
        </button>
        <p className="no23-auth-gate__eyebrow">NO.23 · {intentLabel}</p>
        <h2 id={titleId} className="no23-auth-gate__title">
          {TITLE}
        </h2>
        <p className="no23-auth-gate__body">{BODY}</p>
        <div className="no23-auth-gate__actions">
          {createAccountHref ? (
            <a
              className="no23-auth-gate__btn no23-auth-gate__btn--primary"
              href={createAccountHref}
            >
              Crear cuenta
            </a>
          ) : (
            <button
              type="button"
              className="no23-auth-gate__btn no23-auth-gate__btn--primary"
              onClick={handleCreate}
            >
              Crear cuenta
            </button>
          )}
          {signInHref ? (
            <a
              className="no23-auth-gate__btn no23-auth-gate__btn--ghost"
              href={signInHref}
            >
              Iniciar sesión
            </a>
          ) : (
            <button
              type="button"
              className="no23-auth-gate__btn no23-auth-gate__btn--ghost"
              onClick={handleSignIn}
            >
              Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
