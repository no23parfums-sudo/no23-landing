import type { PerfumePresentation } from "../../lib/presentation";
import { SectionHeading } from "./SectionHeading";

type SignatureCharacterProps = {
  character?: PerfumePresentation["signatureCharacter"];
};

/** Accords as personality — typography and space, never meters. */
export function SignatureCharacter({ character }: SignatureCharacterProps) {
  if (!character?.accords?.length) return null;

  return (
    <section
      className="archive-section signature-character"
      aria-labelledby="signature-character-title"
    >
      <SectionHeading
        id="signature-character-title"
        eyebrow="Carácter"
        title="Carácter firma"
        lede={character.lede}
      />
      <ul className="signature-character__list">
        {character.accords.map((accord) => (
          <li key={accord} className="signature-character__item">
            <span className="signature-character__mark" aria-hidden="true" />
            <span className="signature-character__name">{accord}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
