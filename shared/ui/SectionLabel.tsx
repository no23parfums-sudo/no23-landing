import type { ReactNode } from "react";

type SectionLabelKind = "eyebrow" | "section-kicker" | "mini-label";

type SectionLabelProps = {
  kind: SectionLabelKind;
  children: ReactNode;
};

export function SectionLabel({ kind, children }: SectionLabelProps) {
  return <p className={kind}>{children}</p>;
}
