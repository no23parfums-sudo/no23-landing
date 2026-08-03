"use client";

import { useState, type ReactNode } from "react";
import { useBodyScrollLock } from "@/shared/hooks";
import { AnnouncementBar } from "./AnnouncementBar";
import { MobileMenu } from "./MobileMenu";
import { SearchOverlay } from "./SearchOverlay";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type SiteShellProps = {
  children: ReactNode;
};

export function SiteShell({ children }: SiteShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useBodyScrollLock(menuOpen || searchOpen);

  return (
    <>
      <AnnouncementBar />
      <SiteHeader
        onOpenSearch={() => setSearchOpen(true)}
        onToggleMenu={() => setMenuOpen((open) => !open)}
      />
      <MobileMenu
        isOpen={menuOpen}
        onNavigate={() => setMenuOpen(false)}
      />
      {children}
      <SiteFooter />
      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
