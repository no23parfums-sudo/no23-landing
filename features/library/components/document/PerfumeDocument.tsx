import type { PerfumePresentation } from "../../lib/presentation";
import { CollectionLine } from "./CollectionLine";
import { HistoryTimeline } from "./HistoryTimeline";
import { Moodboard } from "./Moodboard";
import { OlfactiveIdentity } from "./OlfactiveIdentity";
import { OlfactoryArchitecture } from "./OlfactoryArchitecture";
import { PerformanceSection } from "./PerformanceSection";
import { RelatedFragrances } from "./RelatedFragrances";

type PerfumeDocumentProps = {
  presentation: PerfumePresentation;
};

/**
 * Master fragrance document — permanent NO.23 chapter order.
 * Content changes per fragrance; structure does not.
 */
export function PerfumeDocument({ presentation }: PerfumeDocumentProps) {
  return (
    <div className="perfume-document">
      <div className="perfume-document__sheet">
        <OlfactiveIdentity
          signatureNotes={presentation.signatureNotes}
          chapter={presentation.notesChapter}
        />
        <OlfactoryArchitecture presentation={presentation} />
        <Moodboard moodboard={presentation.moodboard} />
        <PerformanceSection performance={presentation.performance} />
        <HistoryTimeline history={presentation.history} />
        <RelatedFragrances related={presentation.related} />
        <CollectionLine collection={presentation.collection} />
      </div>
    </div>
  );
}
