import type { SignatureNote } from "../../lib/presentation";
import { NoteCard } from "./NoteCard";

type OlfactiveIdentityProps = {
  signatureNotes?: SignatureNote[];
};

/**
 * Visual signature — three editorial plates.
 * Images lead; stage labels stay technical and quiet.
 */
export function OlfactiveIdentity({ signatureNotes }: OlfactiveIdentityProps) {
  const notes = signatureNotes?.filter((item) => item.note?.name) ?? [];
  if (!notes.length) return null;

  return (
    <section
      className="archive-section olfactive-identity"
      aria-label="Notas firma"
    >
      <div className="olfactive-identity__stages">
        {notes.map((item) => (
          <div
            key={item.stage}
            className="olfactive-identity__stage"
            data-stage={item.stage}
          >
            <h3 className="olfactive-identity__stage-label">{item.label}</h3>
            <NoteCard
              note={item.note}
              variant="hero"
              editorialLine={item.editorialLine}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
