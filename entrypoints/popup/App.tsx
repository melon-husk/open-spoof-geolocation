import { useEffect, useState } from "react";
import type { AppState, Coordinates } from "@/lib/types";
import { loadState, saveState } from "@/lib/storage";
import { addToHistory } from "@/lib/geo";

function App() {
  const [state, setState] = useState<AppState | null>(null);

  useEffect(() => {
    loadState().then(setState);
  }, []);

  // Persist on every change. The content-script bridge reads the same storage
  // key and pushes updates to open pages live.
  function commit(next: AppState) {
    setState(next);
    saveState(next);
  }

  if (!state) return <div className="loading">Loading…</div>;

  function setCoord(key: keyof Coordinates, raw: string) {
    const n = Number(raw);
    commit({
      ...state!,
      coords: { ...state!.coords, [key]: Number.isNaN(n) ? 0 : n },
    });
  }

  function saveLocation() {
    commit({ ...state!, history: addToHistory(state!.history, state!.coords) });
  }

  function applyCoords(coords: Coordinates) {
    commit({ ...state!, coords });
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-dot" />
          <span className="brand-name">Open Spoof Geolocation</span>
        </div>
        <Switch
          label="Global"
          on={state.enabled}
          onClick={() => commit({ ...state, enabled: !state.enabled })}
        />
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
              value={String(state.coords.latitude)}
              onChange={(e) => setCoord("latitude", e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">Longitude</span>
            <input
              type="text"
              inputMode="decimal"
              value={String(state.coords.longitude)}
              onChange={(e) => setCoord("longitude", e.target.value)}
            />
          </label>
          <label className="field">
            <span className="field-label">Accuracy (m)</span>
            <input
              type="text"
              inputMode="decimal"
              value={String(state.coords.accuracy)}
              onChange={(e) => setCoord("accuracy", e.target.value)}
            />
          </label>
        </div>

        <button className="save-btn" onClick={saveLocation}>
          Save location
        </button>

        {state.history.length > 0 && (
          <div className="history">
            <span className="field-label">Recent</span>
            <div className="chips">
              {state.history.map((c, i) => (
                <button
                  key={i}
                  className="chip"
                  onClick={() => applyCoords(c)}
                  title={`${c.latitude}, ${c.longitude} (±${c.accuracy}m)`}
                >
                  {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="options">
          <Switch
            label="Allow GEO requests"
            on={state.allowGeo}
            onClick={() => commit({ ...state, allowGeo: !state.allowGeo })}
          />
          <Switch
            label="Randomize readings"
            on={state.randomize}
            onClick={() => commit({ ...state, randomize: !state.randomize })}
          />
        </div>
      </main>
    </div>
  );
}

function Switch({
  label,
  on,
  onClick,
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <label className="option">
      <span className="option-label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        className={`toggle ${on ? "on" : ""}`}
        onClick={onClick}
      >
        <span className="knob" />
        <span className="toggle-text">{on ? "ON" : "OFF"}</span>
      </button>
    </label>
  );
}

export default App;
