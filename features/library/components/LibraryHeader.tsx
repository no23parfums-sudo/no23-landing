"use client";

import Link from "next/link";
import { Suspense, useEffect, useId, useState } from "react";
import { useSearchParams } from "next/navigation";
import { LIBRARY_PRIMARY_NAV } from "@/shared/lib/library-nav";
import {
  No23AuthGate,
  type AuthGateIntent,
} from "./document/No23AuthGate";

const DESKTOP_HOVER_NAV =
  "(hover: hover) and (pointer: fine) and (min-width: 981px)";

type LibraryHeaderProps = {
  variant?: "classic" | "identity";
};

function IdentityWordmark() {
  return (
    <>
      <span className="library-brand__name" aria-hidden="true">
        <span className="wm__n">N</span>
        <span className="wm__ord">°</span>
        <span className="wm__num">23</span>
      </span>
      <span className="library-brand__descriptor">Bibliothèque</span>
    </>
  );
}

function BrandLockup() {
  const params = useSearchParams();
  const editorial = params.get("chapter") === "split";

  return (
    <Link
      className="brand library-brand"
      href="/"
      data-lockup={editorial ? "editorial" : "classic"}
    >
      <span className="brand-main">{editorial ? "No.23" : "NO.23"}</span>
      <span className="brand-sub">
        {editorial ? "PARFUMS & DISCOVERY" : "OLFACTORY STUDIO"}
      </span>
    </Link>
  );
}

function SearchIcon() {
  return (
    <svg
      className="header-action__glyph"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="6.15" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M15.55 15.55 20.2 20.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg
      className="header-action__glyph header-action__glyph--account"
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="10.5" r="3.05" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M5.35 20.55c.7-3.2 3.05-4.85 6.65-4.85s5.95 1.65 6.65 4.85"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * Global NO.23 library chrome.
 * Classic: lockup + always-visible primary nav.
 * Identity (perfume): centered mark, icon utilities, hover-revealed nav (desktop).
 */
export function LibraryHeader({ variant = "classic" }: LibraryHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const [gateOpen, setGateOpen] = useState(false);
  const [gateIntent, setGateIntent] = useState<AuthGateIntent>("account");
  const [hoverNavEnabled, setHoverNavEnabled] = useState(false);
  const [navRevealed, setNavRevealed] = useState(false);

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

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_HOVER_NAV);
    const sync = () => {
      setHoverNavEnabled(media.matches);
      if (!media.matches) setNavRevealed(false);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!navRevealed) return;
    const collapse = () => setNavRevealed(false);
    window.addEventListener("scroll", collapse, { passive: true });
    return () => window.removeEventListener("scroll", collapse);
  }, [navRevealed]);

  const requestAccount = () => {
    setGateIntent("account");
    setGateOpen(true);
  };

  if (variant === "identity") {
    return (
      <header
        className="library-header library-header--identity"
        data-nav-expanded={navRevealed ? "true" : "false"}
        onPointerEnter={() => {
          if (hoverNavEnabled) setNavRevealed(true);
        }}
        onPointerLeave={() => setNavRevealed(false)}
      >
        <div className="library-header__bar">
          <Link
            className="library-brand library-brand--mark"
            href="/"
            aria-label="NO.23"
          >
            <IdentityWordmark />
          </Link>

          <div className="library-header__tools">
            <button
              type="button"
              className="library-tool library-tool--icon library-tool--search"
              aria-label="Search"
            >
              <span className="library-tool__icon header-action">
                <SearchIcon />
              </span>
            </button>

            <button
              type="button"
              className="library-tool library-tool--icon library-tool--account"
              aria-label="My Account"
              onClick={requestAccount}
            >
              <span className="library-tool__icon header-action">
                <AccountIcon />
              </span>
              <span className="library-tool__reveal">My Account</span>
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
        </div>

        <nav
          className="library-header__discover"
          aria-label="Principal"
          aria-hidden={!navRevealed}
          inert={!navRevealed || undefined}
        >
          <div className="library-header__discover-inner">
            <ul className="library-header__discover-list">
              {LIBRARY_PRIMARY_NAV.map((item) => (
                <li key={item.id}>
                  <button type="button" className="library-header__discover-item">
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>

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

        <No23AuthGate
          open={gateOpen}
          intent={gateIntent}
          onClose={() => setGateOpen(false)}
        />
      </header>
    );
  }

  return (
    <header className="library-header" data-menu-open={menuOpen ? "true" : "false"}>
      <Suspense
        fallback={
          <Link className="brand library-brand" href="/" data-lockup="classic">
            <span className="brand-main">NO.23</span>
            <span className="brand-sub">OLFACTORY STUDIO</span>
          </Link>
        }
      >
        <BrandLockup />
      </Suspense>

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
            <SearchIcon />
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
