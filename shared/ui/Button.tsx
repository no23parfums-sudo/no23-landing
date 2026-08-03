import type { ReactNode } from "react";

type ButtonVariant = "dark" | "light" | "outline";

type ButtonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
  href?: string;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
};

export function Button({
  children,
  variant,
  className,
  href,
  type = "button",
  onClick,
}: ButtonProps) {
  const classNames = ["button", variant ? `button-${variant}` : null, className]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <a className={classNames} href={href}>
        {children}
      </a>
    );
  }

  return (
    <button className={classNames} type={type} onClick={onClick}>
      {children}
    </button>
  );
}
