import type { ReactNode } from "react";
import Link from "next/link";

type TextLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

function isInternalAppPath(href: string) {
  return href.startsWith("/") && !href.startsWith("//");
}

export function TextLink({ href, children, className }: TextLinkProps) {
  const classNames = ["text-link", className].filter(Boolean).join(" ");

  if (isInternalAppPath(href)) {
    return (
      <Link className={classNames} href={href}>
        {children}
      </Link>
    );
  }

  return (
    <a className={classNames} href={href}>
      {children}
    </a>
  );
}
