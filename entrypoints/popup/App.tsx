import { useEffect, useState } from "react";
import type { AppState } from "@/lib/types";
import { loadState, saveState } from "@/lib/storage";

function App() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    loadState().then(setState);
  }, []);

  // Persist on every change. The content script reads the same storage key.
  function commit(next: AppState) {
    setState(next);
    saveState(next);
  }

  if (!state) return <div className="loading">Loading…</div>;

  function setCoord(key: keyof AppState["coords"], value: number) {
    commit({ ...state!, coords: { ...state!.coords, [key]: value } });
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          <span className="brand-name">Open Spoof Geolocation</span>
        </div>
        <label className="global">
          <span className="global-label">Global</span>
          <button
            type="button"
            role="switch"
            aria-checked={state.enabled}
            className={`toggle ${state.enabled ? "on" : ""}`}
            onClick={() => commit({ ...state, enabled: !state.enabled })}
          >
            <span className="knob" />
            <span className="toggle-text">{state.enabled ? "ON" : "OFF"}</span>
          </button>
        </label>
      </header>

      <main className={`card ${state.enabled ? "" : "paused"}`}>
        <div className="card-head">
          <h1 className="card-title">Spoofed location</h1>
        </div>

        <div className="fields">
          <label className="field">
            <span className="field-label">Latitude</span>
            <input
              type="text"
              inputMode="decimal"
              value={state.coords.latitude}
              onChange={(e) => setCoord("latitude", Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span className="field-label">Longitude</span>
            <input
              type="text"
              inputMode="decimal"
              value={state.coords.longitude}
              onChange={(e) => setCoord("longitude", Number(e.target.value))}
            />
          </label>
          <label className="field">
            <span className="field-label">Accuracy (m)</span>
            <input
              type="text"
              inputMode="decimal"
              value={state.coords.accuracy}
              onChange={(e) => setCoord("accuracy", Number(e.target.value))}
            />
          </label>
        </div>
      </main>
    </div>
  );
}

export default App;
