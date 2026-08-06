type EditorialSentenceProps = {
  children?: string | null;
};

/** Archival one-line observation — museum caption, never marketing. */
export function EditorialSentence({ children }: EditorialSentenceProps) {
  if (!children) return null;

  return <p className="editorial-sentence">{children}</p>;
}
