import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import type { AtmosphereId } from "../lib/atmosphere";

type LibraryShellProps = {
  children: ReactNode;
  mode?: "default" | "perfume";
  atmosphere?: AtmosphereId;
};

export function LibraryShell({
  children,
  mode = "default",
  atmosphere,
}: LibraryShellProps) {
  const isPerfume = mode === "perfume";

  return (
    <div
      className={
        isPerfume ? "library-shell library-shell--perfume" : "library-shell"
      }
      data-perfume-shell={isPerfume ? "" : undefined}
      data-atmosphere={isPerfume ? atmosphere : undefined}
      style={
        isPerfume
          ? ({ "--hero-progress": 0 } as CSSProperties)
          : undefined
      }
    >
      <header className="library-header">
        <Link className="brand library-brand" href="/">
          <span className="brand-main">NO.23</span>
          <span className="brand-sub">OLFACTORY STUDIO</span>
        </Link>
        <nav className="library-nav" aria-label="Biblioteca">
          <Link href="/biblioteca">Biblioteca</Link>
        </nav>
      </header>
      <main
        className={
          isPerfume ? "library-main library-main--perfume" : "library-main"
        }
      >
        {children}
      </main>
      <footer className="library-footer">
        <Link className="brand library-brand" href="/">
          <span className="brand-main">NO.23</span>
        </Link>
        <p>Biblioteca olfativa — piloto</p>
      </footer>
    </div>
  );
}
