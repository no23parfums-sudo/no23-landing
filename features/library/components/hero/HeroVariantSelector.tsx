import Link from "next/link";
import type { CollectionMember } from "../../lib/presentation";

type HeroVariantSelectorProps = {
  members?: CollectionMember[];
  /** Fallback when no variant line is available */
  concentration?: string | null;
};

/**
 * Quiet concentration / variant index for the opening spread.
 * Links only when a record href exists; otherwise inactive.
 */
export function HeroVariantSelector({
  members,
  concentration,
}: HeroVariantSelectorProps) {
  const variants =
    members?.filter((member) => member.concentration) ?? [];

  if (!variants.length) {
    if (!concentration) return null;
    return (
      <p className="hero-variants hero-variants--solo">
        <span className="hero-variants__current">{concentration}</span>
      </p>
    );
  }

  return (
    <nav className="hero-variants" aria-label="Variantes">
      <ul className="hero-variants__list">
        {variants.map((member) => {
          const label = member.concentration!;

          if (member.current) {
            return (
              <li key={member.slug}>
                <span className="hero-variants__current" aria-current="page">
                  {label}
                </span>
              </li>
            );
          }

          if (member.href) {
            return (
              <li key={member.slug}>
                <Link href={member.href} className="hero-variants__link">
                  {label}
                </Link>
              </li>
            );
          }

          return (
            <li key={member.slug}>
              <span className="hero-variants__inactive">{label}</span>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
