# WISH-001 — Country Map (Trail Log 4.0.0 "Trail Atlas")

Planning doc for the world-country map. Companion to `LLM_HANDOFF.md`. This is a
plan, not shipped behavior — keep it out of public release notes.

## Status (2026-05-28)

- **Phase 1 DONE** — persisted `state.world = { regions, notes }` bucket +
  `countriesSeeded` guard added to `defaultState()` and repaired in
  `normalizeState()` (after the US notes block). Zero user-facing change.
  Verified in browser (:8018): fresh + legacy (no-`world`) saves both load with
  no console errors, US map renders all 56 tiles, existing data preserved, and
  the bucket round-trips through save. `exportStateObject` clones it for free;
  `pruneObsoleteBackupKeys` leaves it alone.
- **Phase 2 DONE (region-data seam)** — added runtime `activeLayerId` (default
  `"us"`), a `MAP_LAYERS` registry (`us` → `state.states`, `world` →
  `state.world.regions`), and `activeRegionStore()`. Routed the single
  read/write chokepoint (`getStateLevelIds`/`setStateLevelIds`) through it, so
  `dominantLevel`/`stateLevelNames`/`add`/`toggle` are all layer-aware via one
  change. Verified: US tiles cycle empty→visited→not-interested→empty, writes
  land in `state.states` (not `world`), no console errors. Flipping
  `activeLayerId` to `"world"` will retarget fill data once the switcher exists.
  NOT yet generalized: `renderMap` still iterates `.state-tile`, and `STATE_NAMES`
  / `state.notes` reads stay US-bound — those pair with the world SVG (Phase 3)
  and notes-on-world (Phase 6), where they're actually testable.
- **Phase 3 IN PROGRESS — world SVG embedded + renders (verified)**
  - Source files in repo: `assets/world-map_raw.svg` (1.0 MB BlankMap-World.svg,
    kept so we can switch back) and `assets/world-map.svg` (820 KB optimized).
    `assets/optimize-world-svg.py` regenerates the optimized file from raw
    (strips the embedded stylesheet + root title, rounds coords to 1 decimal,
    collapses whitespace). Paths are RELATIVE, so 1-decimal is the safe floor —
    harder rounding risks coastline drift/gaps. 25.6% reduction.
  - Embedded `#worldMap` into index.html as a hidden sibling right after
    `#stateMap`'s `</svg>` (via a script — 820 KB is impractical to paste).
    index.html is now ~2.90 MB.
  - Added `#worldMap` CSS: `.landxx` fills via `--state-fill` (same model as US
    tiles); `.circlexx`/`.subxx`/`.limitxx` hidden for now (microstates enabled
    in Phase 5).
  - Verified on :8018: app loads with no console errors, US map intact (56
    tiles), `#worldMap` present + hidden with 212 country groups / 319 land paths,
    `#fr`/`#us`/`#gu` present. Debug-unhidden screenshot showed correct gray
    render with per-group `--state-fill` tinting working (FR/BR/AU/JP green).
  - STILL TODO in Phase 3/4: decorate country groups (add `world-tile` class +
    `data-region`/`data-name`), generalize `renderMap` to iterate the active
    layer's tiles, and add the layer switcher (map header + Legend dropdown) that
    flips `activeLayerId`, swaps which SVG shows, and updates the title.
- **Phase 4 DONE — world map is switchable, clickable, persistent (verified)**
  - `initWorldMap()` decorates every ISO-2 country container (`<g id>` or single
    `<path id>`) with `world-tile` class + `data-region`/`data-name` (name from
    the SVG `<title>`) and click/keydown handlers → `handleWorldTap` cycles the
    level. 248 world tiles decorated.
  - `renderMap()` generalized to iterate `activeLayer().tileSelector` and read
    `dataset[codeAttr]`; labels + note pins stay US-only (Phase 6).
  - Switcher: `#mapLayerToggleBtn` in the map header + `setActiveLayer()` /
    `applyActiveLayer()` flip `activeLayerId`, toggle which SVG shows, update the
    `#mapHeading` text, persist `settings.activeLayerId`. Restores on reload.
  - Verified: switch US↔World works, France/Canada/etc. cycle + fill green and
    write to `state.world.regions`, US `state.states` untouched, persists across
    reload, no console errors.
  - **Three gotchas fixed (note for future SVG work):** (1) `MAP_LAYERS`/
    `activeLayerId` had to move ABOVE `loadState()`/`syncRuntimeUiFromSettings()`
    — both run at module load and reference them (TDZ aborted the whole script).
    (2) SVG elements don't reflect the `hidden` IDL property → use
    `el.toggleAttribute("hidden", …)`, not `el.hidden = …`. (3) `#stateMap{display:block}`
    (id specificity) beats UA `[hidden]{display:none}` → added explicit
    `#stateMap[hidden],#worldMap[hidden]{display:none}`.
- **Phase 5 DONE — countries seeded + calm default (verified)**
  - Decision: recolor the shared **Not Interested** level rather than special-case
    the map. Built-in default changed `#111111` → `#9ca3af` (soft gray);
    `LEGACY_NOT_INTERESTED_COLOR` migration in `normalizeState` updates existing
    saves that still hold the old near-black default (US territories go gray too —
    user-approved).
  - `seedCountriesIfNeeded()` runs once after `initMap` (guard `countriesSeeded`):
    defaults every decorated world tile to Not Interested by reading the SVG tiles
    (248 countries). Excluded from stats, so the world starts calm.
  - Microstates enabled: `.circlexx`/`.subxx` now shown + filled via the country
    group's `--state-fill` (Malta/Monaco/etc. clickable). `.limitxx`/`.unxx`
    (disputed overlays) stay hidden; `.oceanxx` set transparent and `.noxx`
    no-data land neutral — these defaulted to SVG black once the source `<style>`
    was stripped.
  - Verified: fresh load seeds 248 countries, world renders calm gray with
    Visited countries green and microstate dots visible, ocean transparent, US
    territories + legend swatch now gray, no console errors.
  - **Preview gotcha:** when reusing the same preview server across edits, the
    browser HTTP-caches index.html — append `?v=Date.now()` to the nav URL (or
    restart the server) to force a fresh fetch after re-copying the snapshot.
- **Phase 7 DONE — per-layer legend/stats scoping (verified)**
  - Added `activeRegionCodes()` (US → `STATES` codes; World → cached
    `worldRegionCodes`, populated during `initWorldMap`). Refactored
    `levelCounts`/`countedStateTotal`/`completionRegionTotal` and `renderLegend`'s
    `totalRegions` to iterate it instead of `STATES`. `dominantLevel` was already
    layer-aware, so the counts retarget automatically.
  - Verified (clean state): US legend "0/51" + 5 Not Interested; World legend
    "0/1" + 248 Not Interested when fresh; after visiting 3 → "100% 3/3", Visited
    1% (3/248), Not Interested 245. Calm denominator works (only non-opted-out
    countries count). No console errors.
  - Minor cosmetic: when every region is opted-out the completion pill floors to
    "0/1" (existing `Math.max(1,…)` behavior). Acceptable; revisit if it reads odd.
- **APP_VERSION/CHANGELOG still NOT bumped.** World map is now coherent (switch +
  click + calm seeded default + scoped legend/stats), but you still can't add
  NOTES to countries (Phase 6) and exports don't include world data (Phase 8).
  Hold the `4.0.0.x` bump + public changelog entry until those land or user asks.
- Next: **Phase 6** world notes/pins.

### Phase 6 direction (user, 2026-05-28): unified notes, layer-filtered display

Notes should cover **every location type** — states, US territories, countries,
and (future) US cities / national parks — and the **active map filters which
groupings + pins are shown**:
- US layer → US states, US territories, and future US places (parks/cities).
- World layer → countries and US territories.
- Territories appear on **both** maps from a single shared note identity.

Implementation approach (incremental, verify US notes after each step):
1. Seam: `regionName(code)` (US `STATE_NAMES`; world names cached in
   `worldRegionNames` during `initWorldMap`) + `activeNotesStore()` (US
   `state.notes`; world `state.world.notes`). Territories always resolve to
   `state.notes` so a territory's notes are shared across both maps.
2. Layer-aware map pins: `locationMarkerItems`/`projectNoteLocation`/
   `renderLocationMarkers` iterate the active layer; countries project to the
   country tile's `getBBox()` center (no per-country geo bounds yet).
3. Note editor target (`openNoteDialog`/`saveNoteFromForm`/`deleteNote`) +
   selected-region detail + `selectedState`/`notesPanelState` validation become
   layer-aware so clicking a country adds/lists its notes.
4. Notes panel groupings, search, filters scope to the active layer.
Storage stays the parallel buckets (`state.notes` US incl. territories,
`state.world.notes` countries); the "store everything" UX is the aggregated,
layer-filtered VIEW, not a physical merge (avoids GA-state vs GA-country key
collisions). Future park/city layers add their own buckets + region types.

Then **Phase 8** exports/imports include the world bucket.

### Phase 6 DONE (2026-05-28) — world notes, layer-filtered (verified)

- **Seam:** `regionName(code)`, `worldRegionNames` (cached in `initWorldMap`),
  `notesStoreForCode(code)` (territories→`state.notes`, countries→`state.world.notes`),
  `regionStoreForCode(code)` (territories→`state.states` on both maps),
  `isValidRegion(code)` (active-layer region check). `getStateLevelIds`/
  `setStateLevelIds`/`sortedNotesFor` route through these. Territories excluded
  from country seeding (they live in the US store, shared across maps).
- **Pins:** `#worldMapMarkers` container created in `initWorldMap`;
  `stateTileCenter`/`locationMarkerItems`/`renderLocationMarkers` are layer-aware
  (`MAP_LAYERS[*].markersId`). Pins render for the active layer; world pins use
  the country tile's `getBBox()` center. Verified US "California: LA" + world
  "France: Paris" pins. (Polish: world pins are small — sized for the US viewBox;
  scale up later.)
- **Editor:** `openNoteDialog`/`saveNoteFromForm`/`deleteNote`/`clearSelectedStateLevels`
  use `notesStoreForCode` + `isValidRegion` + `regionName`. Verified: "Add Note for
  France" dialog saves into `world.notes.FR`; US notes untouched.
- **Panel:** `markedStateAbbrs`/`sortedMarkedStateAbbrs`/`stateMatchesNotesSearch`/
  the list row + compact name + marker labels are layer-aware. Verified: US panel
  lists California, World panel lists France/Canada. No console errors.
- **Verified across the board:** territory edits on world reflect on US; US
  notes/levels fully intact; legend + pins + panel all scope to the active map.
- Deferred: persisting a selected COUNTRY across reload (normalizeState validates
  saved `selectedState`/`notesPanelState` against US `STATE_NAMES`, and
  `worldRegionCodes` isn't known at load — a country selection resets to the list
  on reload; minor). Quick-add location search + geocode "United States" string +
  copy/export-notes text remain US-centric → Phase 8.

### Phase 8 DONE (2026-05-28) — exports/imports include world (verified)

- JSON backup already round-trips `world` (clone + `normalizeState`); verified the
  export carries `world.regions`/`world.notes`/`countriesSeeded` and import
  restores it.
- Markdown / RTF / Plain Text exports gained a **Countries** section listing only
  *engaged* countries (`exportEngagedCountryCodes()` — has notes or a
  stats-counting level; skips the ~240 seeded Not-Interested). Chronological lists
  merge US + world notes. Helper `withLayer(layer, fn)` temporarily forces
  `activeLayerId` so each section uses layer-correct `dominantLevel`/`regionName`/
  notes; exports force US for the main body then restore, so output is correct
  regardless of which map is active. Verified MD/RTF/text from BOTH layers.
- Pin-sizing polish: world markers scaled ~2.95× (US viewBox ~934 vs world ~2754)
  so pins read at a comparable size.

**Pin placement FIXED (2026-05-28):** `stateTileCenter` now anchors on the
**largest sub-shape** within a region's group (the mainland) instead of the whole
group's bbox center. So France pins on Europe, not the French-Guiana-inclusive
bbox center (verified: France marker moved from ~y572 Sahara to ~y296 Europe).
Automatic — no per-country centroid data needed. Single-path US tiles unaffected
(the tile is its own only shape; verified CA marker unchanged at scale 1.0).
Microstate groups anchor on their circle (largest shape). No console errors.

### Polish DONE (2026-05-28) — verified

- **Country location type:** added `country` to `LOCATION_TYPES`; `locationTypeFor`
  returns `country` for non-territory codes on the world layer. Verified the notes
  list groups countries under "Country" while US stays "State".
- **Persist selected country across reload:** added `ensureWorldRegions()` (lazy
  scan of the in-DOM `#worldMap`, available at module load) + `isKnownRegionAnyLayer`;
  `isValidRegion` (world) and `normalizeState`'s selection validation use them, so
  a saved country `notesPanelState` survives reload. Verified France stayed
  selected after reload. `initWorldMap` now reuses `ensureWorldRegions` (no
  double-populate).
- **Fit/scroll parity:** verified the world map renders at the correct aspect
  (~1.97) in both fit and scroll modes — no change needed.
- US notes/grouping unaffected; no console errors.

**WISH-001 is functionally complete + release-coherent.** Only remaining task:
bump `APP_VERSION` to the 4.0.0 line + write the "Trail Atlas" CHANGELOG entry
(theme rules: `notice.summary` ≤100 chars, themed `notice.cta`).
- Preview note: this sandbox's static server can only serve from `/tmp`, so
  previews run from a snapshot copy at `/tmp/vt_site/index.html` (served by
  `/tmp/vt_serve.py`, which passes `directory=` explicitly to dodge a sandboxed
  `os.getcwd()`). Re-copy index.html into `/tmp/vt_site` after edits before
  reloading.

## Goal

Add a world country map beside the US map, built on a **reusable map-layer
system** so future overlays (national parks → WISH-004, bucket list, etc.) plug
into the same machinery instead of bolting on parallel code.

Guiding principle from the user: **"a location is a location."** The data model
must generalize beyond US states; "Countries" is just the first new layer.

## Decisions locked in (2026-05-28)

- **Scope for 4.0.0:** everything *except* historical countries.
  - Historical/defunct countries → split out as **WISH-054** (seeded).
  - The 4.0.0 world SVG is a **simplified** map; a higher-fidelity replacement →
    **WISH-055** (seeded).
- **Countries default to a not-interested level** so adding ~195 countries does
  not blow up the stats / progress counts.
- **Legend stays one Legend** with a **dropdown** to scope it (US-only vs World).
  That switcher must be the *same mechanism* used to switch map layers in the
  map section — one shared "active layer" concept, not two.
- **Modern ISO-3166 countries only** for now.
- **Territories render on BOTH maps as a subset.** Guam/PR/VI/MP/AS keep a single
  region identity and a single notes bucket (a location is a location), grouped
  as a "US Territories" subset on each map rather than mixed into Countries.
- **World SVG (4.0.0): use the detailed `BlankMap-World.svg`** (Wikimedia
  Commons), not a simplified map. Verified: each country is `<g id="<iso2>"
  class="landxx <iso2>">` (multi-part countries group their islands), microstates
  exist as toggleable `circlexx`/`subxx` circles, disputed areas use `limitxx`,
  US territories present (`as gu mp pr vi`), `viewBox` ~`2754×1398`. Raw file ~1.0
  MB → optimize (trim coordinate precision) before inlining; index.html is ~2.08
  MB today so even unoptimized it's a ~50% bump, optimized ~15–25%. Restyle to the
  US look (gray fills via `--state-fill`/equivalent, transparent borders).
- The earlier "simplified SVG" idea is dropped; WISH-055 (upgrade-later) is moot
  and removed.
- WISH-001 retargeted from 5.0.0 → **4.0.0**; tokenCostPct lowered 80 → 72 after
  removing historical scope.
- **Layer model:** base map + overlays. US and World are mutually-exclusive base
  maps; future things like national parks (WISH-004) are toggleable overlays on a
  base. The shared switcher is a base-map selector plus overlay toggles.
- **Not-interested:** a reserved built-in level — recolorable, not deletable,
  `countsTowardStats:false`. New countries default to it.
- **World legend:** a searchable, grouped scrollable list (by continent/region +
  a "US Territories" subset), not the US row/col grid.

## Current architecture (what we're generalizing)

Everything is keyed by US **state abbreviation**:

- `STATES` (index.html ~8265): `[abbr, name, row, col]` rows drive the legend
  grid order; `STATE_NAMES` is the abbr→name lookup; `TERRITORY_IDS` lists the 5
  territories folded into `STATES`.
- Inline SVG `#stateMap` (~6760, `viewBox="0 0 934 593"`): one `<path class="al">`
  per region + `<title>`. At init the paths are decorated into
  `.state-tile[data-abbr][data-name]`.
- Storage (`STORAGE_KEY = "usStateVisitMap.v1"`): `state.states = {CA:["visited"]}`
  and `state.notes = {CA:[{...}]}`, flat, keyed by bare abbr.
- Fill: `renderMap()` (~11914) sets `--state-fill` from `dominantLevel(abbr)`.
- Pins: `projectNoteLocation(abbr,note)` (~11945) maps lat/lng into the path's
  `getBBox()` using per-region `LOCATION_GEO_BOUNDS` (~8281).
- Exports (`STATES.flatMap`/`STATES.map` in MD/RTF/text builders ~15741+) iterate
  the same array.
- Settings carry `selectedState` / `notesPanelState`, repaired against
  `STATE_NAMES` in `normalizeState()` (~10956, 11116).

**Collision problem:** country ISO-2 codes overlap US abbreviations heavily
(GA=Gabon vs Georgia, IN=India vs Indiana, CA=Canada vs California, AL, AR, CO,
LA, MA, MD, MO, MT, NE, …). So regions **must** be namespaced; bare 2-letter keys
cannot be shared across layers.

## Data model: parallel per-layer buckets (low-risk)

**Chosen to avoid a risky global rename of real user data.** The existing US
store (`state.states` / `state.notes`, bare keys, states + territories) is left
**exactly as is** — no migration of existing keys, so no chance of corrupting a
user's trail history. The world layer is added as a **separate bucket** keyed by
ISO-2. Because the two stores never share a key namespace, the GA/IN/CA collision
problem disappears without touching the US data.

```js
const MAP_LAYERS = [
  { id: "us",    label: "United States", svgId: "stateMap",
    store: "us",        // reads existing state.states / state.notes
    defaultLevelMode: "empty",
    subsets: [{ id: "territories", label: "US Territories", codes: TERRITORY_IDS }] },
  { id: "world", label: "World",         svgId: "worldMap",
    store: "world",     // reads state.world.regions / state.world.notes
    category: "Countries", defaultLevelMode: "not-interested",
    subsets: [{ id: "territories", label: "US Territories", codes: TERRITORY_IDS }] },
];
```

A `COUNTRIES` registry mirrors `STATES` for the world layer:

```js
// per country: { code, name, region/continent, geoCentroid:[lat,lng], geoBounds }
//   svg element id = code.toLowerCase()  (BlankMap uses lowercase ISO-2)
```

### Storage shape

```js
state = {
  appVersion, mapName,
  settings: { ..., activeLayerId: "us", overlays: [], legendScope: "active" },
  levels: [...],            // SHARED across layers (one Legend)
  visitTypes: [...],
  states: { CA:["visited"], GU:["visited"] },   // UNCHANGED (US states+territories)
  notes:  { CA:[{...}] },                         // UNCHANGED
  world: {                                        // NEW
    regions: { FR:["want"], JP:["visited"] },     // ISO-2 keys, separate namespace
    notes:   { FR:[{...}] },
  },
  territoryDefaultsSeeded,
  countriesSeeded,          // NEW: not-interested default applied once
}
```

`STORAGE_KEY` string is unchanged; old saves load untouched and just gain an empty
`world` bucket via defaults. Fully expandable: future layers add `state.parks`,
`state.bucketList`, etc., each its own bucket + `MAP_LAYERS` entry.

**Territories as a shared subset:** territories live ONLY in the US store
(`state.states.GU`), never duplicated into `world`. The world layer renders the
territory subset by reading the US store for `TERRITORY_IDS`. BlankMap has shapes
for `as gu mp pr vi`, so on the world map they fill like countries; visiting Guam
counts once and shows on both maps.

**USA on the world map:** BlankMap has `id="us"` (whole-country shape). For 4.0.0,
`world.regions.US` is its own country entry (defaults to not-interested) — it does
NOT auto-derive from US-state progress. Auto-aggregation can be a later polish.

### Levels & the not-interested default — DECIDED

A **reserved built-in "Not Interested" level**: recolorable, not deletable,
`countsTowardStats:false`. New countries default to it so ~195 entries don't skew
progress. Seed it into `levels` (or a parallel reserved slot) without breaking the
"max 5 user levels" rule — decide whether it occupies a level slot or sits outside
the 5. Lean: outside the 5 (a distinct reserved level) so it never eats a user slot.

## Migration / defaults

In `defaultState()` / `normalizeState()`:

1. `state.world` defaults to `{ regions:{}, notes:{} }` when absent. Existing US
   `states`/`notes` are untouched.
2. Seed countries to the not-interested level **once** (guard `countriesSeeded`,
   mirroring `territoryDefaultsSeeded`). Repair `world.regions` against the
   reserved level + `COUNTRIES` codes; repair `world.notes` against levels/tags
   exactly like the US notes path.
3. Add `settings.activeLayerId` (default `"us"`) and `settings.overlays` (default
   `[]`); repair to known layer ids.
4. Backups: `buildBackup` includes `world`; import tolerates its absence (older
   exports just have no world data).

## UI / interaction

- **Map section layer switcher:** a control in the map header to pick the active
  layer (US ↔ World). Only the active layer's SVG renders. Persist
  `settings.activeLayerId`.
- **Legend dropdown:** same switcher surfaced in the Legend; scopes stats /
  region counts to the active (or chosen) layer. Build *one* switcher component
  and reuse it both places — this is also the seam the national-park overlay
  (WISH-004) will hang off, so design it as "choose layer(s)" not "US vs World".
- World map header keeps labels (none / code / name) like the US map.
- Notes panel, filters, selected-region detail operate on the active layer's
  store; the rendering helpers take a layer/store arg instead of assuming the US
  globals.

## World SVG + country data (BlankMap-World.svg, 4.0.0)

Verified structure of `BlankMap-World.svg` (raw ~1.0 MB, `viewBox` ~`2754×1398`):

- Each country: `<g id="<iso2>" class="landxx <iso2>">`; multi-part countries
  (Indonesia, France) hold several `<path>` children in the group. SVG ids are
  **lowercase** ISO-2; our `COUNTRIES` codes are uppercase → map `code.toLowerCase()`.
- **Microstates ARE present** as `circlexx`/`subxx` circles (hidden by default).
  Enable + make them fillable so Malta/Monaco/Singapore/Pacific atolls work — this
  largely removes the need for a custom marker fallback.
- Disputed/limited-recognition areas use `limitxx` (nested). Leave hidden for
  4.0.0 (modern ISO-3166 only).
- US territories present: `as gu mp pr vi`; `us` is the whole-country shape.

Work to do on the SVG:

- **Optimize before inlining:** trim coordinate precision / drop editor cruft to
  cut ~1.0 MB toward ~400–600 KB. Strip its own `<style>`; restyle to the US look
  (gray fill, transparent borders) via our CSS.
- **Fill model:** the US map sets `--state-fill` on each `.state-tile` path. For
  the world layer, fill the country **group** (`g[id]`) — set fill on the group
  or its child paths. Generalize `renderMap` to walk the active layer's tiles
  (`g[id]` for world, `.state-tile` for US) rather than only `.state-tile`.
- **Decorate** each country group into a clickable tile carrying its code + name
  (e.g. `data-region`/`data-name`), via a layer-aware version of the init step
  that decorates the US paths today.
- `COUNTRIES` registry: modern ISO-3166 list — `code`, `name`, region/continent
  (for the grouped legend list), `geoCentroid`, `geoBounds` (pin projection).

## Exports / imports

- Generalize the `STATES.flatMap(...)` iteration in MD/RTF/text/JSON builders to
  iterate per layer, emitting a "United States" section and a "Countries" section
  so output stays readable.
- JSON backup adds the `world` bucket + `settings.activeLayerId`/`overlays` +
  `countriesSeeded`. Import tolerates their absence (older exports have no world
  data); existing US fields are read exactly as today.

## Suggested build order (phased within 4.0.0)

1. **Additive data scaffolding (zero behavior change):** add `MAP_LAYERS`,
   `COUNTRIES`, the reserved Not-Interested level, `state.world`, and
   `settings.activeLayerId`/`overlays` with defaults + normalize repair. US app
   must behave identically; verify in browser on :8018.
2. **Layer-aware render core:** generalize `dominantLevel`/`renderMap`/notes/
   selected-region helpers to take a layer+store; US still the only active layer.
3. **Embed + optimize the world SVG** as a hidden `#worldMap`; decorate country
   groups; confirm it renders gray.
4. **Layer switcher** (base-map selector + overlay toggles) in the map header,
   shared with the Legend dropdown; wire `activeLayerId`.
5. **Countries layer live:** fills, labels, not-interested seeding, microstate
   circles, territory subset reading the US store.
6. **Notes + pins on world:** selected-country detail, pin projection, filters.
7. **Legend grouped country list + scoped stats** (US vs World).
8. **Exports/imports** grouped output + backup round-trip.
9. **Polish:** viewport-lock, mobile single-column, perf with ~195 countries +
   the larger SVG.

Each phase leaves the app working, so regressions are catchable early.

## Open questions (lower stakes, can decide during build)

- Reserved Not-Interested level: occupy a level slot vs sit outside the max-5
  user levels? (Lean: outside the 5.)
- USA-on-world fill: standalone country entry (4.0.0) vs auto-derive from US-state
  progress (later polish)? (Lean: standalone now.)
- World note-pin projection: per-country `getBBox()` + `geoBounds` (like US) is
  enough at this fidelity; revisit only if placement looks off near edges.

## Related roadmap

- **WISH-054** Historical & Defunct Countries (seeded P3) — builds on this layer
  system.
- **WISH-004** National Park Overlay Layer (existing, 4.0.0) — first *overlay*
  consumer of the layer system; the switcher's overlay-toggle path is built for it.
- ~~WISH-055 Higher-Fidelity World Map SVG~~ — removed; 4.0.0 ships the detailed
  BlankMap-World.svg directly, so an upgrade-later item is moot.
