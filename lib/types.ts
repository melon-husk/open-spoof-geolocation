export interface Coordinates {
  latitude: number;
  longitude: number;
  /** Reported accuracy in meters. */
  accuracy: number;
}

export interface AppState {
  /** Master on/off for geolocation spoofing. */
  enabled: boolean;
  /** Whether GEO access is granted. When false, requests are denied. */
  allowGeo: boolean;
  /** Add a small random offset to the reported coordinates on each read. */
  randomize: boolean;
  /** Coordinates reported to pages that call the Geolocation API. */
  coords: Coordinates;
  /** Recently used coordinates, most-recent first (capped at 10). */
  history: Coordinates[];
}

export const STORAGE_KEY = "state";

/** Most-recent-first history is capped at this many entries. */
export const HISTORY_LIMIT = 10;

/**
 * Bridge protocol between the ISOLATED-world storage bridge and the MAIN-world
 * override script. Both share the page's window, so messages travel over
 * window.postMessage; the `source` tag distinguishes them from page traffic.
 */
export const BRIDGE_SOURCE = "open-spoof-geolocation";

export type BridgeMessage =
  /** MAIN → bridge: sent once on load to pull the current config. */
  | { source: typeof BRIDGE_SOURCE; kind: "request" }
  /** bridge → MAIN: the current config, sent on request and on every change. */
  | { source: typeof BRIDGE_SOURCE; kind: "config"; state: AppState };
