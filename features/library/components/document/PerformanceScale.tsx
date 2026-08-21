import type { CSSProperties } from "react";

export type PerformanceScaleMark = {
  label: string;
  at: number;
};

type PerformanceScaleProps = {
  value: number;
  marks?: PerformanceScaleMark[];
  ariaLabel: string;
  /** Optional fill colour — seasons only. */
  tone?: string;
  className?: string;
};

/**
 * Shared precision rail for the split Performance instrument panel.
 * Geometry is always 100%. Active measure is driven by --split-settle.
 */
export function PerformanceScale({
  value,
  marks,
  ariaLabel,
  tone,
  className,
}: PerformanceScaleProps) {
  const t = Math.min(1, Math.max(0, value));
  const last = marks && marks.length > 0 ? marks.length - 1 : 0;

  return (
    <div
      className={["perf-scale", className].filter(Boolean).join(" ")}
      role="img"
      aria-label={ariaLabel}
      style={
        {
          "--scale-value": t,
          ...(tone ? { "--scale-tone": tone } : {}),
        } as CSSProperties
      }
    >
      <div className="perf-scale__rail">
        {marks?.length ? (
          <span className="perf-scale__grads" aria-hidden="true">
            {marks.map((mark) => (
              <span
                key={mark.label}
                className="perf-scale__grad"
                style={{ left: `${mark.at * 100}%` }}
              />
            ))}
          </span>
        ) : null}
        <span className="perf-scale__track" />
        <span className="perf-scale__fill" />
        <span className="perf-scale__marker" aria-hidden="true">
          <span className="perf-scale__tick" />
        </span>
      </div>
      {marks?.length ? (
        <ol className="perf-scale__marks">
          {marks.map((mark, i) => (
            <li
              key={mark.label}
              className="perf-scale__mark"
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
