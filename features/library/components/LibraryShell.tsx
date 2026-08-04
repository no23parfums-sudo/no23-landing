import type { ReactNode } from "react";
import Link from "next/link";

type LibraryShellProps = {
  children: ReactNode;
};

export function LibraryShell({ children }: LibraryShellProps) {
  return (
    <div className="library-shell">
      <header className="library-header">
        <Link className="brand library-brand" href="/">
          <span className="brand-main">NO.23</span>
          <span className="brand-sub">OLFACTORY STUDIO</span>
        </Link>
        <nav className="library-nav" aria-label="Biblioteca">
          <Link href="/biblioteca">Biblioteca</Link>
        </nav>
      </header>
      <main className="library-main">{children}</main>
      <footer className="library-footer">
        <Link className="brand library-brand" href="/">
          <span className="brand-main">NO.23</span>
        </Link>
        <p>Biblioteca olfativa — piloto</p>
      </footer>
    </div>
  );
}
