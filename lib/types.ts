export interface Coordinates {
  latitude: number;
  longitude: number;
  /** Reported accuracy in meters. */
  accuracy: number;
}

export interface AppState {
  /** Master on/off for geolocation spoofing. */
  enabled: boolean;
  /** Coordinates reported to pages that call the Geolocation API. */
  coords: Coordinates;
}

export const STORAGE_KEY = "state";
