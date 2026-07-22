export default defineBackground(() => {
  // Geolocation spoofing happens in the page itself (see entrypoints/content.ts),
  // where navigator.geolocation is overridden. The background service worker is
  // a seam for future coordination — e.g. broadcasting state changes to tabs.
});
