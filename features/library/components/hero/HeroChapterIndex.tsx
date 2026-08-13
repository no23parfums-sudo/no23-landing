/** Permanent master-template chapter index — structure is fixed; content pages share it. */
export const HERO_CHAPTERS = [
  { id: "01", label: "Apertura" },
  { id: "02", label: "Firma" },
  { id: "03", label: "Notas" },
  { id: "04", label: "Arquitectura" },
  { id: "05", label: "Performance" },
  { id: "06", label: "La línea" },
] as const;

type HeroChapterIndexProps = {
  /** Active chapter id, e.g. "01" */
  current?: string;
};

/**
 * Quiet vertical chapter cue for the fragrance study.
 * Same for every perfume — not fragrance-specific.
 */
export function HeroChapterIndex({ current = "01" }: HeroChapterIndexProps) {
  return (
    <nav className="hero-chapters" aria-label="Capítulos">
      <ol className="hero-chapters__list">
        {HERO_CHAPTERS.map((chapter) => {
          const active = chapter.id === current;
          return (
            <li key={chapter.id}>
              <span
                className={
                  active
                    ? "hero-chapters__item hero-chapters__item--current"
                    : "hero-chapters__item"
                }
                aria-current={active ? "true" : undefined}
                title={chapter.label}
              >
                {chapter.id}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
