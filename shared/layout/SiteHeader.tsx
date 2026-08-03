import { NAV_LINKS } from "@/shared/lib/nav";

type SiteHeaderProps = {
  onOpenSearch: () => void;
  onToggleMenu: () => void;
};

export function SiteHeader({ onOpenSearch, onToggleMenu }: SiteHeaderProps) {
  return (
    <header className="site-header" id="top">
      <a className="brand" href="#top">
        <span className="brand-main">NO.23</span>
        <span className="brand-sub">OLFACTORY STUDIO</span>
      </a>
      <nav className="desktop-nav">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </nav>
      <div className="header-actions">
        <button
          className="icon-button"
          aria-label="Buscar"
          data-open-search
          type="button"
          onClick={onOpenSearch}
        >
          ⌕
        </button>
        <a className="account-link" href="#collection">
          Mi cuenta
        </a>
        <button
          className="menu-button"
          aria-label="Abrir menú"
          data-menu-button
          type="button"
          onClick={onToggleMenu}
        >
          <span></span>
          <span></span>
        </button>
      </div>
    </header>
  );
}
