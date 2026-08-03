type EditorialCardProps = {
  artClassName: string;
  artLabel: string;
  meta: string;
  title: string;
  large?: boolean;
};

export function EditorialCard({
  artClassName,
  artLabel,
  meta,
  title,
  large = false,
}: EditorialCardProps) {
  const articleClassName = [
    "editorial-card",
    large ? "editorial-large" : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <article className={articleClassName}>
      <div className={`note-art ${artClassName}`}>
        <span>{artLabel}</span>
      </div>
      <div className="editorial-meta">
        <span>{meta}</span>
        <h3>{title}</h3>
      </div>
    </article>
  );
}
