export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_start",
  // Run in the page's own JS context so we can override the real
  // navigator.geolocation before any page script reads it.
  world: "MAIN",
  main() {
    // TODO: override navigator.geolocation.getCurrentPosition and
    // watchPosition with the spoofed coordinates from storage.
  },
});
