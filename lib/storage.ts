import { STORAGE_KEY, type AppState } from "./types";

export function createId(): string {
  return crypto.randomUUID();
}

export function createDefaultState(): AppState {
  return {
    enabled: false,
    coords: { latitude: 0, longitude: 0, accuracy: 10 },
  };
}

export async function loadState(): Promise<AppState> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  const state = stored[STORAGE_KEY] as AppState | undefined;
  return state ?? createDefaultState();
}

export async function saveState(state: AppState): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: state });
}

/**
 * Subscribe to state changes in storage. Returns an unsubscribe function.
 */
export function onStateChanged(
  callback: (state: AppState) => void,
): () => void {
  const listener = (
    changes: Record<string, chrome.storage.StorageChange>,
    areaName: string,
  ) => {
    if (areaName !== "local" || !changes[STORAGE_KEY]) return;
    const next = changes[STORAGE_KEY].newValue as AppState | undefined;
    if (next) callback(next);
  };
  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}
