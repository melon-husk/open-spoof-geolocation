import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Open Spoof Geolocation",
    description:
      "Open source tool to spoof your browser's geolocation. No tracking, no telemetry.",
    // storage persists your spoofed location locally. contextMenus adds the
    // right-click controls on the toolbar icon (allow/disallow, reset, test).
    permissions: ["storage", "contextMenus"],
    // Required so the geolocation override (a content script) can run on any
    // site you visit. Used ONLY to apply your spoofed location — never to read
    // or exfiltrate browsing data.
    host_permissions: ["<all_urls>"],
  },
});
