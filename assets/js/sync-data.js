// Trail Log's content-only cloud contract. Full JSON backups still include device settings.
function createTrailLogSyncData(options) {
  "use strict";
  const { normalizeState, defaultState, defaultCloud } = options;
  const FORMAT = "trail-log-data";
  const clone = value => JSON.parse(JSON.stringify(value));
  const object = value => Boolean(value && typeof value === "object" && !Array.isArray(value));
  const noteKeys = ["id", "date", "levelId", "city", "where", "what", "who", "lat", "lng", "geocodeLabel", "details", "visitTypes", "priority", "sourceSetId", "sourceItemId", "sourceSetGenerated"];
  const levelKeys = ["id", "name", "definition", "countsTowardStats", "isBucketList"];
  const padKeys = ["id", "name", "icon", "html", "linkedNotes"];
  const pick = (value, keys) => Object.fromEntries(keys.filter(key => value[key] !== undefined).map(key => [key, clone(value[key])]));
  const compact = (store, project) => Object.fromEntries(Object.entries(store || {}).filter(([, items]) => items.length).map(([key, items]) => [key, project(items)]));

  function stableJson(value) {
    if (Array.isArray(value)) return "[" + value.map(stableJson).join(",") + "]";
    if (object(value)) return "{" + Object.keys(value).sort().map(key => JSON.stringify(key) + ":" + stableJson(value[key])).join(",") + "}";
    return JSON.stringify(value);
  }

  function syncPayload(state) {
    // Quick-select notes can have the older sparse shape until the next load.
    const notes = store => compact(store, items => items.map(note => pick({
      date: "", levelId: "", city: "", where: "", what: "", who: "", lat: "", lng: "", geocodeLabel: "", visitTypes: [], priority: "",
      ...note, details: note.details || note.text || ""
    }, noteKeys)).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
    const regions = store => compact(store, items => [...items].sort());
    return { syncFormat: FORMAT, syncVersion: 1, data: {
      mapName: state.mapName,
      // Pack glyphs are attached to managed notes, so their mapping is content metadata.
      packIcons: clone(state.settings?.suggestedSetIcons || {}),
      levels: state.levels.map(level => pick(level, levelKeys)),
      states: regions(state.states), notes: notes(state.notes),
      world: { regions: regions(state.world?.regions), notes: notes(state.world?.notes) },
      basecamp: { pads: (state.basecamp?.pads || []).map(pad => pick(pad, padKeys)) }
    } };
  }

  function syncHash(state) {
    const text = stableJson(syncPayload(state));
    let a = 2166136261, b = 3339675911;
    for (let i = 0; i < text.length; i++) {
      a = Math.imul(a ^ text.charCodeAt(i), 16777619);
      b = Math.imul(b ^ text.charCodeAt(i), 2246822519);
    }
    return "data-v1:" + (a >>> 0).toString(16).padStart(8, "0") + (b >>> 0).toString(16).padStart(8, "0") + ":" + text.length;
  }

  function invalid() { throw new Error("The cloud file contains invalid or unsupported Trail Log content. No data was replaced."); }
  function exactKeys(value, keys) {
    if (!object(value) || Object.keys(value).some(key => !keys.includes(key))) invalid();
  }
  function uniqueItems(items, keys, limit = Infinity) {
    if (!Array.isArray(items) || items.length > limit) invalid();
    const seen = new Set();
    items.forEach(item => {
      exactKeys(item, keys);
      if (typeof item.id !== "string" || !item.id || seen.has(item.id)) invalid();
      seen.add(item.id);
    });
  }
  function validateData(data) {
    exactKeys(data, ["mapName", "packIcons", "levels", "states", "notes", "world", "basecamp"]);
    if (!object(data.packIcons) || Object.entries(data.packIcons).some(([key, value]) => !/^[a-z0-9-]+$/.test(key) || typeof value !== "string")) invalid();
    if (typeof data.mapName !== "string" || !data.mapName.trim() || data.mapName.length > 80) invalid();
    uniqueItems(data.levels, levelKeys, 5);
    if (!data.levels.length) invalid();
    exactKeys(data.world, ["regions", "notes"]);
    exactKeys(data.basecamp, ["pads"]);
    uniqueItems(data.basecamp.pads, padKeys, 20);
    const ids = new Set(data.levels.map(level => level.id));
    const noteIds = new Set();
    [data.states, data.world.regions].forEach(store => {
      if (!object(store)) invalid();
      Object.entries(store).forEach(([code, values]) => {
        if (!/^[A-Z]{2}$/.test(code) || !Array.isArray(values) || values.some(id => !ids.has(id)) || new Set(values).size !== values.length) invalid();
      });
    });
    [data.notes, data.world.notes].forEach(store => {
      if (!object(store)) invalid();
      Object.entries(store).forEach(([code, notes]) => {
        if (!/^[A-Z]{2}$/.test(code)) invalid();
        uniqueItems(notes, noteKeys);
        notes.forEach(note => {
          if (noteIds.has(note.id) || (note.levelId && !ids.has(note.levelId))) invalid();
          noteIds.add(note.id);
        });
      });
    });
  }

  function withData(localState, data) {
    const next = clone(localState);
    const colors = new Map(next.levels.map(level => [level.id, level.color]));
    const pads = new Map((next.basecamp?.pads || []).map(pad => [pad.id, pad]));
    next.mapName = data.mapName;
    next.settings.suggestedSetIcons = clone(data.packIcons);
    next.levels = data.levels.map(level => ({ ...clone(level), color: colors.get(level.id) }));
    next.states = clone(data.states);
    next.notes = clone(data.notes);
    next.world = clone(data.world);
    next.basecamp = { ...next.basecamp, legacyMigrated: true, pads: data.basecamp.pads.map(pad => ({
      ...clone(pad), created: pads.get(pad.id)?.created, updated: pads.get(pad.id)?.updated
    })) };
    next.territoryDefaultsSeeded = true;
    next.countriesSeeded = true;
    next.wantToVisitExcludedMigrated = true;
    delete next.modules; // The engine's transient connection wrapper never enters app state.
    return normalizeState(next);
  }

  function prepareSync(input) {
    if (!object(input)) invalid();
    let envelope = input;
    let legacy = false;
    if (!("syncFormat" in input) && !("syncVersion" in input)) {
      // Accept recognizable full Trail Log backups, never another app's JSON.
      if (typeof input.appVersion !== "string" || !object(input.settings) || !Array.isArray(input.levels)
        || !object(input.states) || !object(input.notes) || typeof input.mapName !== "string") invalid();
      envelope = syncPayload(normalizeState(clone(input)));
      legacy = true;
    }
    if (envelope.syncFormat !== FORMAT || envelope.syncVersion !== 1) throw new Error("This cloud file is not a supported Trail Log data version. Update the app or check the file.");
    exactKeys(envelope, ["syncFormat", "syncVersion", "data"]);
    validateData(envelope.data);
    const state = withData(defaultState(), envelope.data);
    // The ordinary state repair must not silently drop/truncate cloud content.
    if (stableJson(syncPayload(state)) !== stableJson(envelope)) invalid();
    return { state, legacy };
  }

  function applySync(localState, remoteState) {
    const payload = syncPayload(remoteState);
    validateData(payload.data);
    const next = withData(localState, payload.data);
    if (stableJson(syncPayload(next)) !== stableJson(payload)) invalid();
    return next;
  }

  function mergeItems(a, b) {
    const items = new Map();
    a.concat(b).forEach(item => {
      if (items.has(item.id) && stableJson(items.get(item.id)) !== stableJson(item)) throw new Error("The same saved item differs. Choose which copy to keep.");
      items.set(item.id, item);
    });
    return [...items.values()];
  }
  function mergeData(localState, remoteState) {
    const local = syncPayload(localState).data, remote = syncPayload(remoteState).data;
    if (local.mapName !== remote.mapName || stableJson(local.levels) !== stableJson(remote.levels) || stableJson(local.packIcons) !== stableJson(remote.packIcons)) throw new Error("Map names, legend definitions, or Waypoint Pack icons differ. Choose which copy to keep.");
    const mergeStore = (a, b, merge) => Object.fromEntries([...new Set([...Object.keys(a), ...Object.keys(b)])].map(key => [key, merge(a[key] || [], b[key] || [])]));
    const levels = (a, b) => [...new Set(a.concat(b))].sort();
    const data = { ...local,
      states: mergeStore(local.states, remote.states, levels),
      notes: mergeStore(local.notes, remote.notes, mergeItems),
      world: { regions: mergeStore(local.world.regions, remote.world.regions, levels), notes: mergeStore(local.world.notes, remote.world.notes, mergeItems) },
      basecamp: { pads: mergeItems(local.basecamp.pads, remote.basecamp.pads) }
    };
    validateData(data);
    return applySync(localState, prepareSync({ syncFormat: FORMAT, syncVersion: 1, data }).state);
  }
  return { syncPayload, syncHash, prepareSync, applySync, stableJson,
    normalize: clone,
    createDefaultState: () => ({ modules: { cloudSync: defaultCloud() } }),
    canMerge: (local, remote) => { try { mergeData(local, remote); return true; } catch { return false; } },
    merge: mergeData
  };
}
