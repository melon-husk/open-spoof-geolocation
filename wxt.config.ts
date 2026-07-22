import { defineConfig } from "wxt";

// See https://wxt.dev/api/config.html
export default defineConfig({
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Open Spoof Geolocation",
    description:
      "Open source tool to spoof your browser's geolocation. No tracking, no telemetry.",
    // storage persists your spoofed location locally. scripting is used to
    // inject the override into pages that call the Geolocation API.
    permissions: ["storage", "scripting"],
    // Required so the geolocation override can be injected on any site you
    // visit. Used ONLY to apply your spoofed location — never to read or
    // exfiltrate browsing data.
    host_permissions: ["<all_urls>"],
  },
});
