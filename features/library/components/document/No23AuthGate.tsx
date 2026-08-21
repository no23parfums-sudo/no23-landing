"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "motion/react";
import {
  currentAuthReturnTo,
  storeAuthReturnTo,
  withReturnTo,
} from "../../lib/authReturn";

export type AuthGateIntent = "collection" | "wishlist" | "account" | "review";

type No23AuthGateProps = {
  open: boolean;
  intent?: AuthGateIntent;
  onClose: () => void;
  /** Current perfume (or hash) to restore after login/signup. */
  returnTo?: string | null;
  /** Appended when `returnTo` is omitted — resolved from the live URL on open. */
  returnHash?: string;
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
 * Unauthenticated entry for Collection / Wishlist / Account / Reviews.
 * No backend — UI gate only. Wire routes/callbacks later.
 */
export function No23AuthGate({
  open,
  intent = "collection",
  onClose,
  returnTo,
  returnHash,
  createAccountHref,
  signInHref,
  onCreateAccount,
  onSignIn,
}: No23AuthGateProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const path = returnTo ?? currentAuthReturnTo(returnHash);
    if (path) storeAuthReturnTo(path);
  }, [open, returnTo, returnHash]);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const lockedY = window.scrollY;
    closeRef.current?.focus({ preventScroll: true });

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
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      if (Math.abs(window.scrollY - lockedY) > 0.5) {
        window.scrollTo(0, lockedY);
      }
      prev?.focus?.({ preventScroll: true });
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const resolvedReturnTo = returnTo ?? currentAuthReturnTo(returnHash);

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
    intent === "wishlist"
      ? "Wishlist"
      : intent === "account"
        ? "Cuenta"
        : intent === "review"
          ? "Reviews"
          : "Colección";
  const createHref = createAccountHref
    ? withReturnTo(createAccountHref, resolvedReturnTo)
    : undefined;
  const signHref = signInHref
    ? withReturnTo(signInHref, resolvedReturnTo)
    : undefined;

  return createPortal(
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
          {createHref ? (
            <a
              className="no23-auth-gate__btn no23-auth-gate__btn--primary"
              href={createHref}
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
          {signHref ? (
            <a
              className="no23-auth-gate__btn no23-auth-gate__btn--ghost"
              href={signHref}
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
    </div>,
    document.body,
  );
}
