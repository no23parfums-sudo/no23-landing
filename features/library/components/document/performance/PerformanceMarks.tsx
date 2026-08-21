"use client";

import { useId } from "react";
import {
  seasonKind,
  spectrumWeight,
} from "../../../lib/performanceVariantModel";
import type { SpectrumReading } from "../../../lib/presentation";

const PROJECTION_LABELS = ["Piel", "Cercana", "Presente", "Amplia"] as const;
const SILLAGE_LABELS = ["Contenida", "Moderada", "Marcada"] as const;
const DAY_MARKS = [
  { label: "Mañana", at: 0.08 },
  { label: "Mediodía", at: 0.34 },
  { label: "Tarde", at: 0.62 },
  { label: "Noche", at: 0.88 },
] as const;

const SCENT_RINGS = [
  "M34 58 C56 54 78 52 104 58",
  "M32 66 C62 60 96 58 138 68 C156 74 168 82 176 90",
  "M30 74 C66 70 108 72 150 84 C174 94 188 108 196 120",
  "M32 84 C70 86 114 94 152 108 C172 118 184 130 190 140",
  "M36 94 C74 102 116 116 148 130 C164 140 174 150 180 158",
] as const;

const WAKE_PATHS = [
  { d: "M22 36 C78 33 148 30 248 28", w: 1.7, fade: 0 },
  { d: "M22 36 C72 42 138 52 214 58", w: 1.15, fade: 1 },
  { d: "M22 37 C88 28 156 20 206 16", w: 0.85, fade: 2 },
  { d: "M24 36 C96 40 154 50 178 54", w: 0.55, fade: 3 },
] as const;

type Drawn = { drawn?: boolean };

export function LongevityInstrument({
  hoursMin,
  hoursMax,
  ariaLabel,
  drawn = false,
}: {
  value?: number;
  band?: { start: number; end: number } | null;
  hoursMin?: number | null;
  hoursMax?: number | null;
  ariaLabel: string;
} & Drawn) {
  const uid = useId().replace(/:/g, "");
  const start = 0.32;
  const waking = 16;
  const coreEnd = hoursMin
    ? Math.min(0.92, start + hoursMin / waking)
    : 0.76;
  const fadeEnd = hoursMax
    ? Math.min(0.96, start + hoursMax / waking)
    : 0.88;

  return (
    <div
      className={["perf-mark", "perf-mark--time", drawn ? "is-drawn" : null]
        .filter(Boolean)
        .join(" ")}
      role="img"
      aria-label={ariaLabel}
    >
      <svg
        className="perf-mark__svg perf-mark__svg--time"
        viewBox="0 0 560 72"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-band`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--perf-navy)" />
            <stop offset="58%" stopColor="var(--perf-blue)" />
            <stop offset="86%" stopColor="var(--perf-steel)" />
            <stop offset="100%" stopColor="var(--perf-tobacco)" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <line
          className="perf-mark__base"
          x1="8"
          y1="34"
          x2="552"
          y2="34"
          pathLength="1"
        />
        <g className="perf-mark__timeband">
          <rect
            x={8 + start * 544}
            y="28.5"
            width={Math.max(16, (fadeEnd - start) * 544)}
            height="11"
            fill={`url(#${uid}-band)`}
          />
        </g>
        <circle
          className="perf-mark__origin"
          cx={8 + start * 544}
          cy="34"
          r="3.1"
        />
        <circle
          className="perf-mark__ember"
          cx={8 + coreEnd * 544}
          cy="34"
          r="2.2"
        />
        {DAY_MARKS.map((mark) => (
          <line
            key={mark.label}
            className="perf-mark__daytick"
            x1={8 + mark.at * 544}
            y1="22"
            x2={8 + mark.at * 544}
            y2="46"
          />
        ))}
      </svg>
      <ol className="perf-mark__labels perf-mark__labels--day">
        {DAY_MARKS.map((mark, i) => (
          <li
            key={mark.label}
            data-edge={i === 0 ? "start" : i === DAY_MARKS.length - 1 ? "end" : "mid"}
            style={{ left: `${mark.at * 100}%` }}
          >
            {mark.label}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ProjectionArcs({
  level,
  drawn = false,
}: {
  level: number;
} & Drawn) {
  const active = Math.min(3, Math.max(0, level));

  return (
    <div
      className={["perf-mark", "perf-mark--field", drawn ? "is-drawn" : null]
        .filter(Boolean)
        .join(" ")}
    >
      <svg
        className="perf-mark__svg perf-mark__svg--field"
        viewBox="0 0 210 168"
        fill="none"
        aria-hidden="true"
      >
        {SCENT_RINGS.map((d, i) => (
          <path
            key={d}
            d={d}
            pathLength="1"
            className={[
              "perf-field__ring",
              i <= active ? "is-core" : "is-halo",
              i === active ? "is-edge" : null,
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ ["--ring-i" as string]: String(i) }}
          />
        ))}
        <circle className="perf-mark__origin" cx="28" cy="74" r="2.4" />
      </svg>
      <ol className="perf-mark__caption">
        {PROJECTION_LABELS.map((label, i) => (
          <li key={label} data-on={i === active ? "true" : "false"}>
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function SillageTrail({
  level,
  drawn = false,
}: {
  level: number;
} & Drawn) {
  const uid = useId().replace(/:/g, "");
  const active = Math.min(2, Math.max(0, level));

  return (
    <div
      className={["perf-mark", "perf-mark--wake", drawn ? "is-drawn" : null]
        .filter(Boolean)
        .join(" ")}
    >
      <svg
        className="perf-mark__svg perf-mark__svg--wake"
        viewBox="0 0 268 72"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`${uid}-wake`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--perf-navy)" />
            <stop offset="52%" stopColor="var(--perf-blue)" />
            <stop offset="100%" stopColor="var(--perf-navy)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`${uid}-wake-idle`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--perf-line)" />
            <stop offset="100%" stopColor="var(--perf-line)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {WAKE_PATHS.map((path, i) => (
          <path
            key={path.d}
            d={path.d}
            pathLength="1"
            strokeWidth={path.w}
            strokeLinecap="round"
            className={i <= active + 1 ? "perf-wake__stroke is-on" : "perf-wake__stroke"}
            style={{
              stroke: `url(#${uid}-${i <= active + 1 ? "wake" : "wake-idle"})`,
              ["--wake-i" as string]: String(i),
            }}
          />
        ))}
        <circle className="perf-mark__origin" cx="16" cy="36" r="2.5" />
      </svg>
      <ol className="perf-mark__caption">
        {SILLAGE_LABELS.map((label, i) => (
          <li key={label} data-on={i === active ? "true" : "false"}>
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}

function SeasonGlyph({
  kind,
}: {
  kind: "spring" | "summer" | "autumn" | "winter";
}) {
  if (kind === "spring") {
    return (
      <>
        <path d="M12 20 V12.2" strokeLinecap="round" />
        <path
          d="M12 13.2 C8.4 13.2 7.1 9.4 10.1 7.6"
          strokeLinecap="round"
        />
        <path
          d="M12 13.2 C15.6 13.2 16.9 9.4 13.9 7.6"
          strokeLinecap="round"
        />
        <path
          d="M10.2 8.4 C11.5 5.8 12.5 5.8 13.8 8.4"
          strokeLinecap="round"
        />
      </>
    );
  }
  if (kind === "summer") {
    return (
      <>
        <circle cx="12" cy="12.5" r="3.3" />
        <path
          d="M12 5.2 A7.3 7.3 0 0 1 19.3 12.5"
          strokeLinecap="round"
        />
        <path
          d="M12 5.2 A7.3 7.3 0 0 0 4.7 12.5"
          strokeLinecap="round"
          opacity="0.38"
        />
      </>
    );
  }
  if (kind === "autumn") {
    return (
      <path
        d="M8 7.2 C13.2 8.4 16.2 13.6 14.2 19.2 C17.6 14.2 19.2 9.4 15.2 7.2 C13 11.4 10.2 9.6 8 7.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    );
  }
  return (
    <>
      <path d="M12 5 V19" strokeLinecap="round" />
      <path d="M6.4 8.6 L17.6 15.4" strokeLinecap="round" />
      <path d="M17.6 8.6 L6.4 15.4" strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
    </>
  );
}

export function SeasonGlyphs({
  reading,
  drawn = false,
}: {
  reading: SpectrumReading;
} & Drawn) {
  return (
    <ul
      className={["perf-mark", "perf-mark--seasons", drawn ? "is-drawn" : null]
        .filter(Boolean)
        .join(" ")}
    >
      {reading.spectrum.map((label, i) => {
        const kind = seasonKind(label, i);
        const weight = spectrumWeight(reading, i, label);
        return (
          <li
            key={label}
            data-kind={kind}
            data-on={weight >= 0.75 ? "true" : "false"}
            style={{ ["--season-w" as string]: String(weight) }}
          >
            <span className="perf-mark__pigment" aria-hidden="true" />
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <SeasonGlyph kind={kind} />
            </svg>
            <span>{label}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function OccasionNodes({
  reading,
  drawn = false,
  peakIndex = -1,
}: {
  reading: SpectrumReading;
  peakIndex?: number;
} & Drawn) {
  return (
    <div
      className={["perf-mark", "perf-mark--occasion", drawn ? "is-drawn" : null]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="perf-mark__spectrum" aria-hidden="true">
        <span className="perf-mark__band" />
        {reading.spectrum.map((label, i) => {
          const w = spectrumWeight(reading, i, label);
          return (
            <span
              key={label}
              className="perf-mark__dot"
              data-on={w >= 0.75 ? "true" : "false"}
              data-peak={i === peakIndex ? "true" : "false"}
              style={{
                width: `${5 + w * 5}px`,
                height: `${5 + w * 5}px`,
                ["--node-w" as string]: String(w),
              }}
            />
          );
        })}
      </div>
      <ol className="perf-mark__caption">
        {reading.spectrum.map((label, i) => (
          <li
            key={label}
            data-on={
              spectrumWeight(reading, i, label) >= 0.75 ? "true" : "false"
            }
          >
            {label}
          </li>
        ))}
      </ol>
    </div>
  );
}

export function VersatilitySpectrum({
  value,
  poles,
  ariaLabel,
  drawn = false,
}: {
  value: number;
  poles: [string, string];
  ariaLabel: string;
} & Drawn) {
  const t = clamp01(value);
  const widths = [8, 12, 16, 22, 28, 36, 46];

  return (
    <div
      className={["perf-mark", "perf-mark--versatility", drawn ? "is-drawn" : null]
        .filter(Boolean)
        .join(" ")}
      role="img"
      aria-label={ariaLabel}
    >
      <div className="perf-mark__segments" aria-hidden="true">
        {widths.map((w, i) => {
          const threshold = (i + 0.35) / widths.length;
          const on = t >= threshold;
          const lastOn =
            on && (i === widths.length - 1 || t < (i + 1.35) / widths.length);
          return (
            <span
              key={w}
              className="perf-mark__seg"
              data-on={on ? "true" : "false"}
              data-end={lastOn ? "true" : "false"}
              style={{
                width: `${w}px`,
                ["--seg-i" as string]: String(i),
              }}
            />
          );
        })}
      </div>
      <div className="perf-mark__poles">
        <span>{poles[0]}</span>
        <span>{poles[1]}</span>
      </div>
    </div>
  );
}

function clamp01(n: number) {
  return Math.min(1, Math.max(0, n));
}
