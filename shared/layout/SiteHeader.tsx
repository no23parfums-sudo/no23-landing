import type { ReactNode } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/shared/lib/nav";
import { MenuButton } from "./MenuButton";
import { SearchButton } from "./SearchButton";

function NavAnchor({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link className={className} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header" id="top">
      <a className="brand" href="#top">
        <span className="brand-main">NO.23</span>
        <span className="brand-sub">OLFACTORY STUDIO</span>
      </a>
      <nav className="desktop-nav" aria-label="Principal">
        {NAV_LINKS.map((link) => (
          <NavAnchor key={link.href} href={link.href}>
            {link.label}
          </NavAnchor>
        ))}
      </nav>
      <div className="header-actions">
        <SearchButton />
        <a className="account-link" href="#collection">
          Mi cuenta
        </a>
        <MenuButton />
      </div>
    </header>
  );
}
