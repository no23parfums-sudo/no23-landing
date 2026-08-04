import { NAV_LINKS } from "@/shared/lib/nav";
import { MenuButton } from "./MenuButton";
import { SearchButton } from "./SearchButton";

export function SiteHeader() {
  return (
    <header className="site-header" id="top">
      <a className="brand" href="#top">
        <span className="brand-main">NO.23</span>
        <span className="brand-sub">OLFACTORY STUDIO</span>
      </a>
      <nav className="desktop-nav" aria-label="Principal">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
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
