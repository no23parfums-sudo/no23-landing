import type { NotesChapterPresentation } from "../../lib/presentation";

type HeroChapterRevealProps = {
  chapter?: NotesChapterPresentation | null;
};

/**
 * Chapter 02 intro on the dark Hero atmosphere (Beat 2).
 * Content is data-driven — never fragrance-specific markup.
 * Visibility is owned by --hero-chapter-reveal on the perfume shell.
 */
export function HeroChapterReveal({ chapter }: HeroChapterRevealProps) {
  if (!chapter?.eyebrow && !chapter?.title) return null;

  const index = chapter.index ?? "02";
  const eyebrow = chapter.eyebrow;
  const title = chapter.title;
  const lede = chapter.lede;

  return (
    <div className="hero-chapter-reveal" aria-hidden="true">
      <p className="hero-chapter-reveal__meta">
        {index}
        {eyebrow ? (
          <>
            <span className="hero-chapter-reveal__rule" aria-hidden="true">
              —
            </span>
            <span className="hero-chapter-reveal__eyebrow">{eyebrow}</span>
          </>
        ) : null}
      </p>
      {title ? <p className="hero-chapter-reveal__title">{title}</p> : null}
      {lede ? <p className="hero-chapter-reveal__lede">{lede}</p> : null}
    </div>
  );
}
