import type { ReactNode } from "react";

type LibraryShellProps = {
  children: ReactNode;
};

export function LibraryShell({ children }: LibraryShellProps) {
  return (
    <div className="library-shell">
      <header className="library-header">
        <a className="brand library-brand" href="/">
          <span className="brand-main">NO.23</span>
          <span className="brand-sub">OLFACTORY STUDIO</span>
        </a>
        <nav className="library-nav" aria-label="Biblioteca">
          <a href="/biblioteca">Biblioteca</a>
        </nav>
      </header>
      <main className="library-main">{children}</main>
      <footer className="library-footer">
        <a className="brand library-brand" href="/">
          <span className="brand-main">NO.23</span>
        </a>
        <p>Biblioteca olfativa — piloto</p>
      </footer>
    </div>
  );
}
