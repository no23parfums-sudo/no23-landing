import type { PerfumePresentation } from "../../lib/presentation";
import { CollectionLine } from "./CollectionLine";
import { OlfactiveIdentity } from "./OlfactiveIdentity";
import { OlfactivePyramid } from "./OlfactivePyramid";
import { PerformanceSection } from "./PerformanceSection";
import { RelatedFragrances } from "./RelatedFragrances";
import { SignatureCharacter } from "./SignatureCharacter";
import { StorySection } from "./StorySection";

type PerfumeDocumentProps = {
  presentation: PerfumePresentation;
};

/**
 * Archival document that follows the Hero handoff.
 * Section order is the permanent NO.23 fragrance architecture.
 */
export function PerfumeDocument({ presentation }: PerfumeDocumentProps) {
  return (
    <div className="perfume-document">
      <div className="perfume-document__sheet">
        <OlfactiveIdentity signatureNotes={presentation.signatureNotes} />
        <SignatureCharacter character={presentation.signatureCharacter} />
        <PerformanceSection performance={presentation.performance} />
        <OlfactivePyramid pyramid={presentation.pyramid} />
        <StorySection story={presentation.story} />
        <RelatedFragrances related={presentation.related} />
        <CollectionLine collection={presentation.collection} />
      </div>
    </div>
  );
}
