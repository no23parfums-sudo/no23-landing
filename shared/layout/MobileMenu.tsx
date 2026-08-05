"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/shared/lib/nav";
import { useChromeState } from "./ChromeState";

function NavAnchor({
  href,
  children,
  onClick,
}: {
  href: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link href={href} onClick={onClick}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} onClick={onClick}>
      {children}
    </a>
  );
}

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
        <NavAnchor key={link.href} href={link.href} onClick={closeMenu}>
          {link.label}
        </NavAnchor>
      ))}
    </nav>
  );
}
