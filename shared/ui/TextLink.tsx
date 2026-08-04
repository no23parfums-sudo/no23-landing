import type { ReactNode } from "react";

type TextLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
};

export function TextLink({ href, children, className }: TextLinkProps) {
  const classNames = ["text-link", className].filter(Boolean).join(" ");
  return (
    <a className={classNames} href={href}>
      {children}
    </a>
  );
}
