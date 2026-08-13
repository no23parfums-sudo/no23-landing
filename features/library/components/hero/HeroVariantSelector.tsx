import Link from "next/link";
import type { CollectionMember } from "../../lib/presentation";

type HeroVariantSelectorProps = {
  members?: CollectionMember[];
  /** Fallback when no variant line is available */
  concentration?: string | null;
  /** inline = compact under title; rail = labeled control in metadata column */
  placement?: "inline" | "rail";
  /** Controlled selection (in-hero family swap) */
  selectedSlug?: string | null;
  onSelect?: (member: CollectionMember) => void;
};

function displayLabel(
  member: CollectionMember,
  placement: "inline" | "rail",
): string {
  if (placement === "rail") {
    return member.concentration ?? member.shortConcentration ?? member.name;
  }
  return member.shortConcentration ?? member.concentration ?? member.name;
}

/**
 * Concentration switch — editorial index for navigating sibling concentrations.
 * When onSelect is provided, switches in place (hero plate swap).
 * Otherwise links when href exists.
 */
export function HeroVariantSelector({
  members,
  concentration,
  placement = "inline",
  selectedSlug,
  onSelect,
}: HeroVariantSelectorProps) {
  const variants =
    members?.filter(
      (member) => member.concentration || member.shortConcentration,
    ) ?? [];

  if (!variants.length) {
    if (!concentration) return null;
    return (
      <div
        className={
          placement === "rail"
            ? "hero-variants hero-variants--rail hero-variants--solo"
            : "hero-variants hero-variants--solo"
        }
      >
        {placement === "rail" ? (
          <span className="hero-variants__label">Concentración</span>
        ) : null}
        <span className="hero-variants__current">{concentration}</span>
      </div>
    );
  }

  const activeSlug =
    selectedSlug ??
    variants.find((member) => member.current)?.slug ??
    null;

  return (
    <nav
      className={
        placement === "rail"
          ? "hero-variants hero-variants--rail"
          : "hero-variants"
      }
      aria-label="Concentración"
    >
      {placement === "rail" ? (
        <span className="hero-variants__label">Concentración</span>
      ) : null}
      <ul className="hero-variants__list">
        {variants.map((member, index) => {
          const label = displayLabel(member, placement);
          const full = member.concentration ?? label;
          const isActive = activeSlug
            ? member.slug === activeSlug
            : Boolean(member.current);

          return (
            <li key={member.slug} className="hero-variants__item">
              {placement === "inline" && index > 0 ? (
                <span className="hero-variants__rule" aria-hidden="true">
                  |
                </span>
              ) : null}
              {onSelect ? (
                <button
                  type="button"
                  className={
                    isActive
                      ? "hero-variants__current"
                      : "hero-variants__link"
                  }
                  aria-current={isActive ? "true" : undefined}
                  title={full}
                  onClick={() => {
                    if (!isActive) onSelect(member);
                  }}
                >
                  {label}
                </button>
              ) : isActive ? (
                <span
                  className="hero-variants__current"
                  aria-current="true"
                  title={full}
                >
                  {label}
                </span>
              ) : member.href ? (
                <Link
                  href={member.href}
                  className="hero-variants__link"
                  title={full}
                >
                  {label}
                </Link>
              ) : (
                <span className="hero-variants__inactive" title={full}>
                  {label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
