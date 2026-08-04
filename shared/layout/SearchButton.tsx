"use client";

import { useChromeState } from "./ChromeState";

export function SearchButton() {
  const { openSearch, searchOpen, searchTriggerRef } = useChromeState();

  return (
    <button
      ref={searchTriggerRef}
      className="icon-button"
      aria-label="Buscar"
      aria-expanded={searchOpen}
      aria-controls="search-overlay"
      data-open-search
      type="button"
      onClick={openSearch}
    >
      ⌕
    </button>
  );
}
