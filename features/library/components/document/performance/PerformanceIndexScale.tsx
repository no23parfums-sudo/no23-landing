import type { CSSProperties } from "react";
import type { PerformanceScaleMark } from "../PerformanceScale";

type PerformanceIndexScaleProps = {
  value: number;
  marks?: PerformanceScaleMark[];
  ariaLabel: string;
  /** Calibrated band, 0–1. Longevity hours when present. */
  band?: { start: number; end: number } | null;
  compact?: boolean;
  drawn?: boolean;
  className?: string;
};

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}

/**
 * Editorial measurement instrument for Variant C.
 * Idle structure is warm gray; the active reading uses --perf-accent.
 */
export function PerformanceIndexScale({
  value,
  marks,
  ariaLabel,
  band,
  compact = false,
  drawn = false,
  className,
}: PerformanceIndexScaleProps) {
  const t = clamp01(value);
  const start = band ? clamp01(Math.min(band.start, band.end)) : null;
  const end = band ? clamp01(Math.max(band.start, band.end)) : null;
  const last = marks && marks.length > 0 ? marks.length - 1 : 0;

  return (
    <div
      className={[
        "perf-c-scale",
        compact ? "perf-c-scale--compact" : null,
        drawn ? "is-drawn" : null,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      role="img"
      aria-label={ariaLabel}
      style={{ "--scale-value": t } as CSSProperties}
    >
      <div className="perf-c-scale__rail">
        {marks?.length ? (
          <span className="perf-c-scale__grads" aria-hidden="true">
            {marks.map((mark) => (
              <span
                key={mark.label}
                className="perf-c-scale__grad"
                style={{ left: `${mark.at * 100}%` }}
              />
            ))}
          </span>
        ) : null}
        <span className="perf-c-scale__track" />
        {start !== null && end !== null ? (
          <span
            className="perf-c-scale__span"
            style={{
              left: `${start * 100}%`,
              width: `${Math.max(0.02, end - start) * 100}%`,
            }}
          />
        ) : compact ? null : (
          <span
            className="perf-c-scale__span perf-c-scale__span--to-value"
            style={{ width: `${t * 100}%` }}
          />
        )}
        <span
          className="perf-c-scale__needle"
          style={{ left: `${t * 100}%` }}
        />
      </div>
      {marks?.length ? (
        <ol className="perf-c-scale__marks">
          {marks.map((mark, i) => (
            <li
              key={mark.label}
              className="perf-c-scale__mark"
              data-edge={i === 0 ? "start" : i === last ? "end" : "mid"}
              style={{ left: `${mark.at * 100}%` }}
            >
              {mark.label}
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}
