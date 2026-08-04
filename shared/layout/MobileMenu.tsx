"use client";

import { useEffect, useRef } from "react";
import { NAV_LINKS } from "@/shared/lib/nav";
import { useChromeState } from "./ChromeState";

export function MobileMenu() {
  const { menuOpen, closeMenu, menuTriggerRef } = useChromeState();
  const navRef = useRef<HTMLElement | null>(null);
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (menuOpen) {
      wasOpenRef.current = true;
      const firstLink = navRef.current?.querySelector("a");
      firstLink?.focus();
      return;
    }

    if (wasOpenRef.current) {
      wasOpenRef.current = false;
      menuTriggerRef.current?.focus();
    }
  }, [menuOpen, menuTriggerRef]);

  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen, closeMenu]);

  return (
    <nav
      ref={navRef}
      id="mobile-menu"
      className={`mobile-menu${menuOpen ? " is-open" : ""}`}
      data-mobile-menu
      aria-label="Menú móvil"
      aria-hidden={!menuOpen}
      inert={!menuOpen}
    >
      {NAV_LINKS.map((link) => (
        <a key={link.href} href={link.href} onClick={closeMenu}>
          {link.label}
        </a>
      ))}
    </nav>
  );
}
