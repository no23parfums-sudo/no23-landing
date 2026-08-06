type SectionHeadingProps = {
  id?: string;
  eyebrow?: string;
  title: string;
  lede?: string;
};

/** Quiet section masthead for the archival document. */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lede,
}: SectionHeadingProps) {
  return (
    <header className="archive-section__heading">
      {eyebrow ? <span className="archive-section__eyebrow">{eyebrow}</span> : null}
      <h2 id={id} className="archive-section__title">
        {title}
      </h2>
      {lede ? <p className="archive-section__lede">{lede}</p> : null}
    </header>
  );
}
