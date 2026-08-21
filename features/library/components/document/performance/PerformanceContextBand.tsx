import type { PerformanceVariantModel } from "../../../lib/performanceVariantModel";
import {
  spectrumActiveLabels,
  splitEditorialReading,
} from "../../../lib/performanceVariantModel";
import { PerformanceIndexScale } from "./PerformanceIndexScale";

type PerformanceContextBandProps = {
  model: PerformanceVariantModel;
  drawn?: boolean;
  emphasizeVersatility?: boolean;
};

/**
 * Concluding editorial matrix — season / occasion / versatility.
 * One composition, not three dashboard rows.
 */
export function PerformanceContextBand({
  model,
  drawn = false,
  emphasizeVersatility = false,
}: PerformanceContextBandProps) {
  const seasonCopy = model.seasons
    ? splitEditorialReading(model.seasons.reading)
    : null;
  const seasonTags = model.seasons ? spectrumActiveLabels(model.seasons) : [];
  const occasionTags = model.occasions?.spectrum ?? [];

  if (!model.seasons && !model.occasions && !model.versatilityMarker) {
    return null;
  }

  return (
    <div
      className="perf-x__matrix"
      data-active={drawn ? "true" : "false"}
      data-emphasis={emphasizeVersatility ? "versatility" : "even"}
    >
      {model.seasons && seasonCopy ? (
        <article className="perf-x__cell">
          <p className="perf-x__label">Estación</p>
          <p className="perf-x__cell-lead">{seasonCopy.primary}</p>
          {seasonCopy.secondary ? (
            <p className="perf-x__cell-note">{seasonCopy.secondary}</p>
          ) : null}
          {seasonTags.length ? (
            <p className="perf-x__tags">
              {seasonTags.map((label, i) => (
                <span key={label}>
                  {i > 0 ? <span aria-hidden="true"> · </span> : null}
                  {label}
                </span>
              ))}
            </p>
          ) : null}
        </article>
      ) : null}

      {model.occasions ? (
        <article className="perf-x__cell">
          <p className="perf-x__label">Ocasión</p>
          <p className="perf-x__cell-lead">{model.occasions.reading}</p>
          {occasionTags.length ? (
            <p className="perf-x__tags">
              {occasionTags.map((label, i) => (
                <span key={label}>
                  {i > 0 ? <span aria-hidden="true"> · </span> : null}
                  {label}
                </span>
              ))}
            </p>
          ) : null}
        </article>
      ) : null}

      {model.versatilityMarker ? (
        <article className="perf-x__cell perf-x__cell--versatility">
          <p className="perf-x__label">Versatilidad</p>
          <p
            className={
              emphasizeVersatility ? "perf-x__result" : "perf-x__cell-lead"
            }
          >
            {model.versatilityMarker}
          </p>
          <PerformanceIndexScale
            value={model.versatilityPosition}
            band={{ start: 0, end: model.versatilityPosition }}
            marks={[
              { label: model.versatilityPoles[0], at: 0 },
              { label: model.versatilityPoles[1], at: 1 },
            ]}
            ariaLabel={model.versatilityReading ?? model.versatilityMarker}
            compact
            drawn={drawn}
            className="perf-c-scale--poles"
          />
        </article>
      ) : null}
    </div>
  );
}
