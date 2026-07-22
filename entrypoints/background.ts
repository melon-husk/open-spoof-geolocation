import { createDefaultState, loadState, onStateChanged, saveState } from "@/lib/storage";
import type { AppState } from "@/lib/types";

const MENU = {
  title: "title",
  allow: "allow-geo",
  reset: "reset-geo",
  test: "test-geo",
} as const;

const TEST_URL = "https://webbrowsertools.com/geolocation/";

export default defineBackground(() => {
  // Context menus don't persist across restarts in MV3, so (re)build them on
  // both install and startup. removeAll() first avoids duplicate-id errors.
  browser.runtime.onInstalled.addListener(setupMenus);
  browser.runtime.onStartup.addListener(setupMenus);

  browser.contextMenus.onClicked.addListener(async (info) => {
    const state = await loadState();
    if (info.menuItemId === MENU.allow) {
      await saveState({ ...state, allowGeo: info.checked ?? !state.allowGeo });
    } else if (info.menuItemId === MENU.reset) {
      const defaults = createDefaultState();
      await saveState({ ...state, coords: defaults.coords, history: [] });
    } else if (info.menuItemId === MENU.test) {
      await browser.tabs.create({ url: TEST_URL });
    }
  });

  // Keep the menu checkbox and toolbar badge in sync with stored state.
  onStateChanged(reflectState);
});

async function setupMenus() {
  const state = await loadState();
  await browser.contextMenus.removeAll();

  browser.contextMenus.create({
    id: MENU.title,
    title: "Spoof Geolocation",
    contexts: ["action"],
    enabled: false,
  });
  browser.contextMenus.create({
    id: MENU.allow,
    title: "Allow/Disallow GEO requests",
    type: "checkbox",
    checked: state.allowGeo,
    contexts: ["action"],
  });
  browser.contextMenus.create({
    id: MENU.reset,
    title: "Reset GEO data (ask for new values on first request)",
    contexts: ["action"],
  });
  browser.contextMenus.create({
    id: "separator",
    type: "separator",
    contexts: ["action"],
  });
  browser.contextMenus.create({
    id: MENU.test,
    title: "Test GEO location",
    contexts: ["action"],
  });

  reflectState(state);
}

function reflectState(state: AppState) {
  browser.contextMenus.update(MENU.allow, { checked: state.allowGeo });
  browser.action.setBadgeText({ text: state.enabled ? "ON" : "OFF" });
  browser.action.setBadgeBackgroundColor({
    color: state.enabled ? "#2563eb" : "#64748b",
  });
}
