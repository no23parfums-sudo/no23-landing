"use client";

import { useChromeState } from "./ChromeState";

export function MenuButton() {
  const { menuOpen, toggleMenu, menuTriggerRef } = useChromeState();

  return (
    <button
      ref={menuTriggerRef}
      className="menu-button"
      aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
      aria-expanded={menuOpen}
      aria-controls="mobile-menu"
      data-menu-button
      type="button"
      onClick={toggleMenu}
    >
      <span></span>
      <span></span>
    </button>
  );
}
