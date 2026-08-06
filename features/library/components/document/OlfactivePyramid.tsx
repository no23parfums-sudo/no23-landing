import type { PerfumePresentation } from "../../lib/presentation";
import { SectionHeading } from "./SectionHeading";

type OlfactivePyramidProps = {
  pyramid?: PerfumePresentation["pyramid"];
};

/** Complete technical note reference — the full catalogue, not the curated identity. */
export function OlfactivePyramid({ pyramid }: OlfactivePyramidProps) {
  const stages = pyramid?.stages?.filter((s) => s.notes.length) ?? [];
  if (!stages.length) return null;

  return (
    <section
      className="archive-section olfactive-pyramid"
      aria-labelledby="pyramid-title"
    >
      <SectionHeading
        id="pyramid-title"
        eyebrow="Referencia"
        title="Pirámide olfativa"
        lede="El inventario completo de la composición."
      />
      <div className="olfactive-pyramid__stages">
        {stages.map((stage) => (
          <div key={stage.id} className="olfactive-pyramid__stage">
            <h3 className="olfactive-pyramid__label">{stage.label}</h3>
            <ul className="olfactive-pyramid__notes">
              {stage.notes.map((note) => (
                <li key={`${stage.id}-${note.name}`}>{note.name}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
