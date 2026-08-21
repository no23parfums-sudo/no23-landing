/** Permanent master-template chapter index — structure is fixed; content pages share it. */
export type HeroChapter = {
  id: string;
  label: string;
};

export const DEFAULT_HERO_CHAPTERS: readonly HeroChapter[] = [
  { id: "01", label: "Apertura" },
  { id: "02", label: "Firma" },
  { id: "03", label: "Notas" },
  { id: "04", label: "Arquitectura" },
  { id: "05", label: "Performance" },
] as const;

/** @deprecated Prefer DEFAULT_HERO_CHAPTERS — kept for existing imports */
export const HERO_CHAPTERS = DEFAULT_HERO_CHAPTERS;

type HeroChapterIndexProps = {
  /** Active chapter id, e.g. "01" */
  current?: string;
  /** Optional filtered list — rail is 01–05 */
  chapters?: readonly HeroChapter[];
};

/**
 * Quiet vertical chapter cue for the fragrance study.
 * Same for every perfume — not fragrance-specific.
 * Final chapter is 05.
 */
export function HeroChapterIndex({
  current = "01",
  chapters = DEFAULT_HERO_CHAPTERS,
}: HeroChapterIndexProps) {
  return (
    <nav className="hero-chapters" aria-label="Capítulos">
      <ol className="hero-chapters__list">
        {chapters.map((chapter) => {
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
