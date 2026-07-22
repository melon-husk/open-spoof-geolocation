export interface LocationPreset {
  name: string;
  latitude: number;
  longitude: number;
}

/**
 * Well-known locations offered as quick picks in the popup. Selecting one sets
 * latitude/longitude and leaves the user's accuracy untouched. Coordinates are
 * city-center reference points.
 */
export const LOCATION_PRESETS: LocationPreset[] = [
  { name: "London", latitude: 51.507351, longitude: -0.127758 },
  { name: "New York", latitude: 40.712776, longitude: -74.005974 },
  { name: "San Francisco", latitude: 37.774929, longitude: -122.419418 },
  { name: "Toronto", latitude: 43.653225, longitude: -79.383186 },
  { name: "São Paulo", latitude: -23.55052, longitude: -46.633308 },
  { name: "Paris", latitude: 48.856613, longitude: 2.352222 },
  { name: "Berlin", latitude: 52.520008, longitude: 13.404954 },
  { name: "Dubai", latitude: 25.204849, longitude: 55.270782 },
  { name: "Mumbai", latitude: 19.075983, longitude: 72.877655 },
  { name: "Singapore", latitude: 1.352083, longitude: 103.819839 },
  { name: "Tokyo", latitude: 35.689487, longitude: 139.691711 },
  { name: "Sydney", latitude: -33.86882, longitude: 151.20929 },
];

/** Name of the preset matching these coordinates, or "" for a custom location. */
export function matchPresetName(
  latitude: number,
  longitude: number,
): string {
  const match = LOCATION_PRESETS.find(
    (p) => p.latitude === latitude && p.longitude === longitude,
  );
  return match?.name ?? "";
}
