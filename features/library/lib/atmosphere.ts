/**
 * Atmosphere IDs map to CSS tokens in styles/atmosphere.css.
 * Layout and typography stay constant; only the world changes.
 */
export const ATMOSPHERES = [
  "nocturne",
  "daylight",
  "stone",
  "sand",
  "mist",
  "snow",
  "marble",
  "copper",
  "greenery",
  "forest",
] as const;

export type AtmosphereId = (typeof ATMOSPHERES)[number];

export const DEFAULT_ATMOSPHERE: AtmosphereId = "daylight";

export function isAtmosphereId(value: string): value is AtmosphereId {
  return (ATMOSPHERES as readonly string[]).includes(value);
}
