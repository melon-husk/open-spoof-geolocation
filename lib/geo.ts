import { HISTORY_LIMIT, type Coordinates } from "./types";

/**
 * A GeolocationPosition-shaped plain object. The Geolocation API callbacks only
 * read these properties, so a literal is sufficient — no need for the real
 * (construction-blocked) GeolocationPosition class.
 */
export interface SpoofedPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    altitudeAccuracy: number | null;
    heading: number | null;
    speed: number | null;
  };
  timestamp: number;
}

/** Max random offset applied to each coordinate, in degrees (~50m of jitter). */
const JITTER_DEGREES = 0.0009;

/**
 * Build the position object reported to the page. When `randomize` is on, the
 * latitude and longitude are nudged by a small random offset so repeated reads
 * aren't byte-for-byte identical.
 */
export function spoofedPosition(
  coords: Coordinates,
  randomize: boolean,
): SpoofedPosition {
  const jitter = () => (randomize ? (Math.random() - 0.5) * JITTER_DEGREES : 0);
  return {
    coords: {
      latitude: coords.latitude + jitter(),
      longitude: coords.longitude + jitter(),
      accuracy: coords.accuracy,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  };
}

function sameCoords(a: Coordinates, b: Coordinates): boolean {
  return (
    a.latitude === b.latitude &&
    a.longitude === b.longitude &&
    a.accuracy === b.accuracy
  );
}

/**
 * Prepend `coords` to the history, drop any duplicate, and cap the list at
 * HISTORY_LIMIT. Returns a new array; the input is not mutated.
 */
export function addToHistory(
  history: Coordinates[],
  coords: Coordinates,
): Coordinates[] {
  const deduped = history.filter((c) => !sameCoords(c, coords));
  return [coords, ...deduped].slice(0, HISTORY_LIMIT);
}
