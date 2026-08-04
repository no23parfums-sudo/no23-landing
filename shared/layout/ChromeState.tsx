"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { useBodyScrollLock } from "@/shared/hooks";

type ChromeStateValue = {
  menuOpen: boolean;
  searchOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
  toggleMenu: () => void;
  closeMenu: () => void;
  searchTriggerRef: RefObject<HTMLButtonElement | null>;
  menuTriggerRef: RefObject<HTMLButtonElement | null>;
};

const ChromeStateContext = createContext<ChromeStateValue | null>(null);

export function ChromeStateProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchTriggerRef = useRef<HTMLButtonElement | null>(null);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  useBodyScrollLock(menuOpen || searchOpen);

  const openSearch = useCallback(() => {
    setMenuOpen(false);
    setSearchOpen(true);
  }, []);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
  }, []);

  const toggleMenu = useCallback(() => {
    setSearchOpen(false);
    setMenuOpen((open) => !open);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      menuOpen,
      searchOpen,
      openSearch,
      closeSearch,
      toggleMenu,
      closeMenu,
      searchTriggerRef,
      menuTriggerRef,
    }),
    [
      menuOpen,
      searchOpen,
      openSearch,
      closeSearch,
      toggleMenu,
      closeMenu,
    ],
  );

  return (
    <ChromeStateContext.Provider value={value}>
      {children}
    </ChromeStateContext.Provider>
  );
}

export function useChromeState() {
  const context = useContext(ChromeStateContext);
  if (!context) {
    throw new Error("useChromeState must be used within ChromeStateProvider");
  }
  return context;
}
