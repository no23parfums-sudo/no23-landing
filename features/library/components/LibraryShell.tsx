import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import type { AtmosphereId } from "../lib/atmosphere";
import { LibraryHeader } from "./LibraryHeader";

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
          ? ({
              "--hero-progress": 0,
              "--hero-photo-fade": 0,
              "--hero-ui-fade": 0,
              "--hero-doc-rise": 0,
              "--hero-depth-bg": "0vh",
              "--hero-depth-ui": "0vh",
            } as CSSProperties)
          : undefined
      }
    >
      <LibraryHeader />
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
