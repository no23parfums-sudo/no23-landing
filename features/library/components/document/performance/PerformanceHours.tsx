type PerformanceHoursProps = {
  min: number | null;
  max: number | null;
  fallback?: string | null;
  size?: "display" | "quiet";
};

export function PerformanceHours({
  min,
  max,
  fallback,
  size = "display",
}: PerformanceHoursProps) {
  if (min !== null && max !== null) {
    return (
      <p className={`perf-x__hours perf-x__hours--${size}`}>
        <span className="perf-x__hours-range">
          {min}
          <span aria-hidden="true">—</span>
          {max}
        </span>
        <span className="perf-x__hours-unit">H</span>
      </p>
    );
  }
  if (!fallback) return null;
  return (
    <p className={`perf-x__hours perf-x__hours--${size}`}>
      <span className="perf-x__hours-range">{fallback}</span>
    </p>
  );
}
