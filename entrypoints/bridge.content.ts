import { BRIDGE_SOURCE, type AppState, type BridgeMessage } from "@/lib/types";
import { loadState, onStateChanged } from "@/lib/storage";

// Runs in the ISOLATED world (has extension-storage access) alongside the
// MAIN-world spoof script. It reads the config from storage and relays it to
// the page over window messages, then keeps it in sync on every change.
export default defineContentScript({
  matches: ["<all_urls>"],
  runAt: "document_start",
  main() {
    function postConfig(state: AppState) {
      const message: BridgeMessage = {
        source: BRIDGE_SOURCE,
        kind: "config",
        state,
      };
      window.postMessage(message, "*");
    }

    // Answer the MAIN script's on-load request.
    window.addEventListener("message", (event) => {
      if (event.source !== window) return;
      const msg = event.data as BridgeMessage | undefined;
      if (!msg || msg.source !== BRIDGE_SOURCE || msg.kind !== "request") return;
      loadState().then(postConfig);
    });

    // Push proactively (covers the race where our listener isn't ready when the
    // MAIN script sends its request) and on every subsequent change.
    loadState().then(postConfig);
    onStateChanged(postConfig);
  },
});
