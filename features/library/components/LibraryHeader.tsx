"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { LIBRARY_PRIMARY_NAV } from "@/shared/lib/library-nav";

/**
 * Global NO.23 library chrome — restrained editorial navigation.
 * Items are interactive but do not navigate until destinations exist.
 */
export function LibraryHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="library-header" data-menu-open={menuOpen ? "true" : "false"}>
      <Link className="brand library-brand" href="/">
        <span className="brand-main">NO.23</span>
        <span className="brand-sub">OLFACTORY STUDIO</span>
      </Link>

      <nav className="library-nav library-nav--primary" aria-label="Principal">
        <ul className="library-nav__list">
          {LIBRARY_PRIMARY_NAV.map((item) => (
            <li key={item.id}>
              <button type="button" className="library-nav__item">
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="library-header__tools">
        <button type="button" className="library-tool library-tool--search">
          <span className="library-tool__icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="5.8" cy="5.8" r="4.3" stroke="currentColor" strokeWidth="1" />
              <path d="M9.2 9.2 12.5 12.5" stroke="currentColor" strokeWidth="1" />
            </svg>
          </span>
          <span className="library-tool__label">Search</span>
        </button>

        <button
          type="button"
          className="library-tool library-tool--menu"
          aria-expanded={menuOpen}
          aria-controls={menuId}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span className="library-tool__label">Menu</span>
          <span className="library-tool__grid" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        </button>
      </div>

      <div
        id={menuId}
        className="library-mobile-panel"
        hidden={!menuOpen}
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Menú">
          <ul>
            {LIBRARY_PRIMARY_NAV.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  className="library-mobile-panel__item"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </button>
              </li>
            ))}
            <li>
              <button
                type="button"
                className="library-mobile-panel__item"
                onClick={() => setMenuOpen(false)}
              >
                Search
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
