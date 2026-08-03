import { NAV_LINKS } from "@/shared/lib/nav";

type MobileMenuProps = {
  isOpen: boolean;
  onNavigate: () => void;
};

export function MobileMenu({ isOpen, onNavigate }: MobileMenuProps) {
  return (
    <div
      className={`mobile-menu${isOpen ? " is-open" : ""}`}
      data-mobile-menu
    >
      {NAV_LINKS.map((link) => (
        <a key={link.href} href={link.href} onClick={onNavigate}>
          {link.label}
        </a>
      ))}
    </div>
  );
}
