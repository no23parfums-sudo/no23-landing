"use client";

import { useEffect, useId, useRef } from "react";
import { useChromeState } from "./ChromeState";

const SUGGESTIONS = ["Ganymede", "Iris", "Xerjoff", "Quentin Bisch"] as const;

export function SearchOverlay() {
  const { searchOpen, closeSearch, searchTriggerRef } = useChromeState();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wasOpenRef = useRef(false);
  const titleId = useId();

  useEffect(() => {
    if (searchOpen) {
      wasOpenRef.current = true;
      inputRef.current?.focus();
      return;
    }

    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      searchTriggerRef.current?.focus();
    }
  }, [searchOpen, searchTriggerRef]);

  useEffect(() => {
    if (!searchOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeSearch();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [searchOpen, closeSearch]);

  return (
    <div
      id="search-overlay"
      className={`search-overlay${searchOpen ? " is-open" : ""}`}
      data-search-overlay
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-hidden={!searchOpen}
      inert={!searchOpen}
    >
      <button
        className="search-close"
        data-close-search
        type="button"
        aria-label="Cerrar búsqueda"
        onClick={closeSearch}
      >
        ×
      </button>
      <div className="search-inner">
        <span id={titleId}>BUSCAR EN NO.23</span>
        <label className="sr-only" htmlFor="site-search">
          Buscar perfume, casa, nota o perfumista
        </label>
        <input
          ref={inputRef}
          id="site-search"
          type="search"
          placeholder="Perfume, casa, nota o perfumista"
        />
        <div className="search-suggestions">
          {SUGGESTIONS.map((suggestion) => (
            <span key={suggestion}>{suggestion}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
