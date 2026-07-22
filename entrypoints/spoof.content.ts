import {
  BRIDGE_SOURCE,
  type AppState,
  type BridgeMessage,
} from "@/lib/types";
import { spoofedPosition } from "@/lib/geo";

// Runs in the page's own JS context (MAIN world) at document_start so the
// overrides are installed before any page script reads navigator.geolocation.
// MAIN-world scripts can't touch extension storage, so the ISOLATED-world
// bridge (bridge.content.ts) feeds us the current config over window messages.
export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_start",
  world: "MAIN",
  main() {
    installSpoofing();
  },
});

type SuccessCb = (position: unknown) => void;
type ErrorCb = (error: unknown) => void;

function installSpoofing() {
  // Capture the real implementations before we shadow them, so we can delegate
  // when spoofing is disabled. Any of these may be undefined (no GEO device).
  const realGeo = navigator.geolocation as Geolocation | undefined;
  const realGetCurrent = realGeo?.getCurrentPosition?.bind(realGeo);
  const realWatch = realGeo?.watchPosition?.bind(realGeo);
  const realClear = realGeo?.clearWatch?.bind(realGeo);
  const realPermissions = navigator.permissions as Permissions | undefined;
  const realQuery = realPermissions?.query?.bind(realPermissions);

  // --- Config, fed by the ISOLATED-world bridge ---------------------------
  let state: AppState | null = null;
  const waiters: Array<(state: AppState) => void> = [];

  function whenReady(): Promise<AppState> {
    if (state) return Promise.resolve(state);
    return new Promise((resolve) => waiters.push(resolve));
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window) return;
    const msg = event.data as BridgeMessage | undefined;
    if (!msg || msg.source !== BRIDGE_SOURCE || msg.kind !== "config") return;
    state = msg.state;
    while (waiters.length) waiters.shift()!(state);
  });

  // Ask the bridge for the current config. The bridge also pushes it
  // proactively, so this is just a backstop against listener-ordering races.
  post({ source: BRIDGE_SOURCE, kind: "request" });

  function post(message: BridgeMessage) {
    window.postMessage(message, "*");
  }

  // --- Geolocation error shaped like GeolocationPositionError -------------
  function deniedError(): unknown {
    return {
      code: 1,
      message: "User denied Geolocation",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    };
  }

  // --- navigator.geolocation overrides ------------------------------------
  function getCurrentPosition(
    success: SuccessCb,
    error?: ErrorCb,
    options?: PositionOptions,
  ) {
    whenReady().then((s) => {
      if (!s.enabled) {
        if (realGetCurrent) realGetCurrent(success, error, options);
        else error?.(deniedError());
        return;
      }
      if (!s.allowGeo) {
        error?.(deniedError());
        return;
      }
      success(spoofedPosition(s.coords, s.randomize));
    });
  }

  let nextWatchId = 1;
  const intervals = new Map<number, number>();
  const realWatchIds = new Map<number, number>();

  function watchPosition(
    success: SuccessCb,
    error?: ErrorCb,
    options?: PositionOptions,
  ): number {
    const id = nextWatchId++;
    whenReady().then((s) => {
      if (!s.enabled) {
        if (realWatch) realWatchIds.set(id, realWatch(success, error, options));
        else error?.(deniedError());
        return;
      }
      if (!s.allowGeo) {
        error?.(deniedError());
        return;
      }
      success(spoofedPosition(s.coords, s.randomize));
      // When randomizing, keep emitting fresh jittered readings. The tick reads
      // the latest `state` so live config changes are reflected.
      if (s.randomize) {
        const handle = window.setInterval(() => {
          if (state?.enabled && state.allowGeo) {
            success(spoofedPosition(state.coords, state.randomize));
          }
        }, 1000);
        intervals.set(id, handle);
      }
    });
    return id;
  }

  function clearWatch(id: number) {
    const handle = intervals.get(id);
    if (handle !== undefined) {
      clearInterval(handle);
      intervals.delete(id);
    }
    const realId = realWatchIds.get(id);
    if (realId !== undefined && realClear) {
      realClear(realId);
      realWatchIds.delete(id);
    }
  }

  const fakeGeolocation = {
    getCurrentPosition: mask(getCurrentPosition, "getCurrentPosition"),
    watchPosition: mask(watchPosition, "watchPosition"),
    clearWatch: mask(clearWatch, "clearWatch"),
  };

  // Shadow the Navigator.prototype getter with an own property. This also
  // polyfills geolocation when it was absent (no GEO device / globally off).
  Object.defineProperty(navigator, "geolocation", {
    configurable: true,
    enumerable: true,
    get: () => fakeGeolocation,
  });

  // --- navigator.permissions.query override -------------------------------
  function permissionsQuery(desc: PermissionDescriptor): Promise<unknown> {
    if (desc?.name !== "geolocation") {
      return realQuery
        ? realQuery(desc)
        : Promise.reject(new TypeError("permissions.query is not available"));
    }
    return whenReady().then((s) => {
      if (!s.enabled && realQuery) return realQuery(desc);
      const value = s.enabled ? (s.allowGeo ? "granted" : "denied") : "prompt";
      return makePermissionStatus(value);
    });
  }

  if (realPermissions) {
    Object.defineProperty(navigator.permissions, "query", {
      configurable: true,
      writable: true,
      value: mask(permissionsQuery, "query"),
    });
  }
}

/** A PermissionStatus-shaped object (pages read `state` and add listeners). */
function makePermissionStatus(value: string): unknown {
  const target = new EventTarget();
  return {
    name: "geolocation",
    state: value,
    onchange: null,
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
    dispatchEvent: target.dispatchEvent.bind(target),
  };
}

/** Make an override read like a native function to casual tamper checks. */
function mask<T extends (...args: never[]) => unknown>(fn: T, name: string): T {
  try {
    Object.defineProperty(fn, "name", { value: name, configurable: true });
    Object.defineProperty(fn, "toString", {
      configurable: true,
      writable: true,
      value: () => `function ${name}() { [native code] }`,
    });
  } catch {
    // Non-fatal: masking is cosmetic.
  }
  return fn;
}
