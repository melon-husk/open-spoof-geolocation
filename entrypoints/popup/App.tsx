import { useEffect, useState } from "react";
import type { AppState, Coordinates, SavedLocation } from "@/lib/types";
import { createId, loadState, saveState } from "@/lib/storage";
import { addToHistory } from "@/lib/geo";
import { LOCATION_PRESETS, matchPresetName } from "@/lib/presets";

function App() {
  const [state, setState] = useState<AppState | null>(null);
  const [presetName, setPresetName] = useState("");

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

  // Keep the user's accuracy; only the position changes.
  function applyPosition(latitude: number, longitude: number) {
    applyCoords({ latitude, longitude, accuracy: state!.coords.accuracy });
  }

  // Dropdown option values are prefixed: "b:<name>" built-in, "c:<id>" custom.
  function selectPreset(value: string) {
    if (value.startsWith("b:")) {
      const p = LOCATION_PRESETS.find((x) => x.name === value.slice(2));
      if (p) applyPosition(p.latitude, p.longitude);
    } else if (value.startsWith("c:")) {
      const p = state!.customPresets.find((x) => x.id === value.slice(2));
      if (p) applyPosition(p.latitude, p.longitude);
    }
    // "" (Custom) → leave the current coordinates as-is.
  }

  function addCustomPreset() {
    const name = presetName.trim();
    if (!name) return;
    const { latitude, longitude } = state!.coords;
    // Replace any existing preset with the same name (case-insensitive).
    const others = state!.customPresets.filter(
      (p) => p.name.toLowerCase() !== name.toLowerCase(),
    );
    const saved: SavedLocation = { id: createId(), name, latitude, longitude };
    commit({ ...state!, customPresets: [...others, saved] });
    setPresetName("");
  }

  function removeCustomPreset(id: string) {
    commit({
      ...state!,
      customPresets: state!.customPresets.filter((p) => p.id !== id),
    });
  }

  const { latitude, longitude } = state.coords;
  const customMatch = state.customPresets.find(
    (p) => p.latitude === latitude && p.longitude === longitude,
  );
  const builtinMatch = matchPresetName(latitude, longitude);
  const selectedPreset = customMatch
    ? `c:${customMatch.id}`
    : builtinMatch
      ? `b:${builtinMatch}`
      : "";

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
            <span className="field-label">Preset location</span>
            <select
              className="preset"
              value={selectedPreset}
              onChange={(e) => selectPreset(e.target.value)}
            >
              <option value="">Custom</option>
              <optgroup label="Presets">
                {LOCATION_PRESETS.map((p) => (
                  <option key={p.name} value={`b:${p.name}`}>
                    {p.name}
                  </option>
                ))}
              </optgroup>
              {state.customPresets.length > 0 && (
                <optgroup label="My locations">
                  {state.customPresets.map((p) => (
                    <option key={p.id} value={`c:${p.id}`}>
                      {p.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            {customMatch && (
              <button
                type="button"
                className="link-btn"
                onClick={() => removeCustomPreset(customMatch.id)}
              >
                Remove “{customMatch.name}”
              </button>
            )}
          </label>
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

        <div className="add-preset">
          <input
            type="text"
            className="preset-name"
            placeholder="Name this location"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addCustomPreset()}
          />
          <button
            className="save-btn"
            onClick={addCustomPreset}
            disabled={!presetName.trim()}
          >
            Add preset
          </button>
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
