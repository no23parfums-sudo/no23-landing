import type {
  ContinuumReading,
  PerformancePresentation,
  SpectrumReading,
} from "../../lib/presentation";
import { SectionHeading } from "./SectionHeading";

type PerformanceSectionProps = {
  performance?: PerformancePresentation;
};

type BoardItem = {
  key: keyof PerformancePresentation;
  label: string;
  reading: string;
  kind: "continuum" | "rings" | "spectrum" | "span";
  position?: number;
  spectrum?: string[];
  active?: string[];
  poles?: [string, string];
};

function Continuum({ position = 0.5 }: { position?: number }) {
  const clamped = Math.min(1, Math.max(0, position));
  return (
    <div
      className="perf-visual__continuum"
      style={{ ["--perf-pos" as string]: String(clamped) }}
      aria-hidden="true"
    >
      <span className="perf-visual__continuum-line" />
      <span className="perf-visual__continuum-node" />
    </div>
  );
}

function PresenceRings({ position = 0.5 }: { position?: number }) {
  const clamped = Math.min(1, Math.max(0, position));
  return (
    <div
      className="perf-visual__rings"
      style={{ ["--perf-pos" as string]: String(clamped) }}
      aria-hidden="true"
    >
      <span />
      <span />
      <span />
    </div>
  );
}

function Spectrum({
  spectrum,
  active,
}: {
  spectrum: string[];
  active?: string[];
}) {
  const activeSet = new Set(active ?? []);
  return (
    <ul className="perf-visual__spectrum" aria-hidden="true">
      {spectrum.map((item) => (
        <li key={item} data-active={activeSet.has(item) ? "true" : "false"}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function VersatilitySpan({
  position = 0.5,
  poles = ["Íntimo", "Declarativo"],
}: {
  position?: number;
  poles?: [string, string];
}) {
  const clamped = Math.min(1, Math.max(0, position));
  return (
    <div
      className="perf-visual__span"
      style={{ ["--perf-pos" as string]: String(clamped) }}
      aria-hidden="true"
    >
      <span className="perf-visual__span-pole">{poles[0]}</span>
      <span className="perf-visual__span-track">
        <span className="perf-visual__span-node" />
      </span>
      <span className="perf-visual__span-pole">{poles[1]}</span>
    </div>
  );
}

function toBoard(performance: PerformancePresentation): BoardItem[] {
  const items: BoardItem[] = [];

  const pushContinuum = (
    key: "longevity" | "sillage" | "projection",
    label: string,
    kind: "continuum" | "rings",
    value?: ContinuumReading,
  ) => {
    if (!value?.reading) return;
    items.push({
      key,
      label,
      reading: value.reading,
      kind,
      position: value.position,
    });
  };

  pushContinuum("longevity", "Longevidad", "continuum", performance.longevity);
  pushContinuum("projection", "Proyección", "rings", performance.projection);
  pushContinuum("sillage", "Sillage", "rings", performance.sillage);

  if (performance.seasons?.reading && performance.seasons.spectrum.length) {
    const seasons: SpectrumReading = performance.seasons;
    items.push({
      key: "seasons",
      label: "Estación",
      reading: seasons.reading,
      kind: "spectrum",
      spectrum: seasons.spectrum,
      active: seasons.active,
    });
  }

  if (performance.occasions?.reading && performance.occasions.spectrum.length) {
    const occasions: SpectrumReading = performance.occasions;
    items.push({
      key: "occasions",
      label: "Ocasión",
      reading: occasions.reading,
      kind: "spectrum",
      spectrum: occasions.spectrum,
      active: occasions.active,
    });
  }

  if (performance.versatility?.reading) {
    items.push({
      key: "versatility",
      label: "Versatilidad",
      reading: performance.versatility.reading,
      kind: "span",
      position: performance.versatility.position,
      poles: performance.versatility.poles,
    });
  }

  return items;
}

function FacetVisual({ item }: { item: BoardItem }) {
  switch (item.kind) {
    case "continuum":
      return <Continuum position={item.position} />;
    case "rings":
      return <PresenceRings position={item.position} />;
    case "spectrum":
      return item.spectrum?.length ? (
        <Spectrum spectrum={item.spectrum} active={item.active} />
      ) : null;
    case "span":
      return (
        <VersatilitySpan position={item.position} poles={item.poles} />
      );
    default:
      return null;
  }
}

/**
 * Wear profile — consumes PerformancePresentation only.
 * Never bars, ratings, or fragrance-specific markup.
 */
export function PerformanceSection({ performance }: PerformanceSectionProps) {
  if (!performance) return null;
  const board = toBoard(performance);
  if (!board.length) return null;

  return (
    <section
      className="archive-section performance-section"
      aria-labelledby="performance-title"
    >
      <SectionHeading
        id="performance-title"
        eyebrow="Uso"
        title="Performance"
        lede="Cómo habita el tiempo, el espacio y la ocasión."
      />
      <div className="performance-section__board">
        {board.map((item) => (
          <article
            key={item.key}
            className="performance-section__facet"
            data-facet={item.key}
          >
            <header className="performance-section__facet-head">
              <span className="performance-section__label">{item.label}</span>
              <strong className="performance-section__value">
                {item.reading}
              </strong>
            </header>
            <FacetVisual item={item} />
          </article>
        ))}
      </div>
    </section>
  );
}
