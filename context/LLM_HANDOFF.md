# LLM Handoff

Copy this into new chats:

```text
Continue work in /Users/stripes/Documents/GitHub/visit-tracker. Read context/LLM_HANDOFF.md first. Respect manual edits. Run git status --short before editing. Use port 8018 for local preview. Current development line is Trail Log 4.1.0 "Bucket List".
```

## Release Notes

For every completed change:

- Bump the fourth `APP_VERSION` build number.
- When finalizing a release, set `APP_VERSION` to the released semantic version and collapse same-line patch/build notes into that release entry.
- Update `CHANGELOG` using the collapsed release-note format: `Major.Minor.Patch :: YYYY-mm-dd :: Cheeky theme name`, then a bold one-line summary, then `highlights` and `updates`.
- Keep `highlights` short: **max 4 bullets, each ≤100 characters.** Anything longer or extra goes in `updates` (the fuller, denser change list).
- Release Notes UI shows each release as a scannable card: header + summary + visible Highlights, with the Full Update List behind a clear collapsed toggle.
- The release `notice.summary` must never exceed 100 characters.
- The release `notice.cta` changes per version like the theme name and should be themed toward that release's title along with an exclamation point! (e.g. a Basecamp release → "Set Up Camp!").
- Keep changelog wording public-safe: describe features and changes, not internal tickets, prompts, or workflow mechanics.
- When manual or unexpected edits are present, identify their app/docs effect and include it in `CHANGELOG` alongside the current update.
- Keep the current major/minor release entry updated unless intentionally opening a new release line.
- Preserve the localStorage schema where possible.
- Give me a push commit summary and description in two distinct containers that make copy and paste very easy.

## Snapshot

- Trail Log is a single-file, local-first HTML/CSS/JS app.
- Main file: `index.html`
- Docs: `README.md`, this handoff
- Storage key: `usStateVisitMap.v1`
- Current version: `APP_VERSION = "4.1.0"` — the 4.1.0 "Bucket List" release is cut (semantic version, no build segment). Start the next change by opening a new release line (e.g. `4.1.0.1` or `4.1.1.1`) and a fresh `CHANGELOG` entry.
- Latest public release: Trail Log 4.1.0 "Wayfinder" (legend-level role + quick-switch mode — WISH-036 shipped)
- Branch: `4-1-0-Bucket-List`.
- Plan + full build log: `context/WISH-036-BUCKET-LIST-PLAN.md` (level-role design, mode behavior, every phase + verification notes).
- Prior plan: `context/WISH-001-COUNTRY-MAP-PLAN.md` (layer architecture, data model from 4.0.0).
- No build step, backend, or dependencies.
- User data lives in browser localStorage. Locate is the only intentional online action and only runs when clicked.

## Rules

- Run `git status --short` before editing.
- Manual edits are authoritative. Preserve dirty work unless the user explicitly asks to revert it.
- Edit surgically, especially in `index.html`; do not reformat the file.
- Use `apply_patch` for manual edits.
- App behavior changes usually require `APP_VERSION`/`CHANGELOG` updates. Docs-only, handoff-only, or planning-only edits do not need release churn unless the user asks.
- New persisted fields need defaults in `defaultState()` and repair/defaulting in `normalizeState()`.
- Keep release notes public-facing: describe shipped behavior, not prompts or internal workflow.
- Roadmap seeds are developer-facing defaults only; do not persist user roadmap data in backups.
- Roadmap item shape: `title`, `ticketId`, `description`, `priority`, `effort`, `targetKind`, `targetVersion`, `tokenCostPct`, `prompt`, `category`.
- Destructive UI actions should use `requestConfirm(...)`.

## Quick Commands

```sh
rg -n "APP_VERSION|STORAGE_KEY|WISHLIST_SEEDS|CHANGELOG" index.html
rg -n "function defaultState|function normalizeState|function save" index.html
rg -n "function renderNotesPanel|function renderMap|function bindEvents" index.html
node -e "const fs=require('fs'); const h=fs.readFileSync('index.html','utf8'); const scripts=[...h.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]); new Function(scripts.at(-1)); console.log('main script parses');"
git diff --check
python3 -m http.server 8018
```

Open `http://127.0.0.1:8018/index.html` for preview. Stop the server before final response.

## App Shape

Runtime flow: `state = loadState()` -> `init()` -> `initMap()` / `bindEvents()` / `render()`.

State basics:

```js
{
  appVersion, mapName,
  settings: { ..., activeLayerId, mapLabels, ..., selectedState, notesPanelState, collapsedNoteCategories, legendPosition },
  levels: [{ id, name, definition, color, countsTowardStats }],
  visitTypes: [{ id, label, icon, shortcut, enabled, searchTags }],
  states: { CA: ["visited"] },                 // US states + territories
  notes: { CA: [{ id, date, levelId, city, where, what, who, lat, lng, geocodeLabel, details, text, visitTypes }] },
  world: { regions: { FR: ["visited"] }, notes: { FR: [ ... ] } },  // countries (ISO-2), territories stay in states/notes
  territoryDefaultsSeeded, countriesSeeded
}
```

Map layers (4.0.0): `MAP_LAYERS` (`us` | `world`) + runtime `activeLayerId`.
Wayfinder (4.1.0): per-level `isBucketList` flag (only one, must be excluded
from stats — internal symbol kept for schema; user-facing name is
"Wayfinder"); `settings.bucketListView` + `settings.bucketListFilterSnapshot`
power the quick-switch mode. Helpers: `bucketListLevel()`,
`bucketListLevelId()`, `applyBucketListFlag()`, `setBucketListView()`,
`syncBucketListUi()`. Highlights drive off `html[data-bucket-mode]` (teal).
Region helpers resolve by active layer: `activeRegionStore`/`regionStoreForCode`
(level data), `notesStoreForCode` (notes; territories → US store on both maps),
`activeRegionCodes` (stats/list universe), `regionName`, `isValidRegion`,
`ensureWorldRegions` (lazy code/name scan from `#worldMap`).

Important invariants:

- Dates normalize to `YYYY`, `YYYY-MM`, `YYYY-MM-DD`, or `""`.
- Coordinates are numbers or `""`.
- `levels` max is 5; level order controls map color.
- `visitTypes` are configurable icon tags; shortcuts should stay unique among active tags.
- Saved Notes filters are repaired against current level/tag ids.
- Selected-location Notes detail ignores main-list filters.
- Match Notes map filtering follows active Notes filters.

## Current Surface

- Map: SVG state/territory map, scroll/fit modes, pan/zoom persistence, labels, clustered note pins, Match Notes filtering.
- Legend: editable levels, colors, definitions, stats behavior, drag reorder, swipe quick actions, movable desktop placement.
- Notes: search, sort, compact/expanded/text views, category grouping, icon filters, excluded toggle, coordinate filter, date precision filter, selected-location detail.
- Note editor: Quick Add, City/Where/What/Who/Details, local field suggestions, Smart Convert, partial/flexible dates, weekday preview, manual/lookup coordinates, multiple icon tags.
- Location Icon Tags: configurable active tags plus auto-discovered More Icons from `__*_CIRCLE` constants, generated labels/search tags, explicit aliases, aliased-first sorting.
- Help/What's New/Roadmap live under Settings-style tabs.
- Exports: JSON, Markdown, RTF, plain text.

## Recent Release

4.1.0 "Wayfinder" is cut — WISH-036. (Internal symbols use the original
"BucketList" naming for schema preservation; user-facing strings are
"Wayfinder".) It covers:

- Per-level `isBucketList` role flag (only one at a time, must be excluded
  from stats). New Wayfinder checkbox in the level editor and idempotent
  seed pass that flags `want-to-visit` on first load and renames its
  definition to "Wayfinder" (previous default "Bucket List" also migrates).
- Mirrored quick-switch toggle: map header (next to `#mapMatchNotesBtn`)
  and Notes header (next to `#copyNotesTextBtn`). Pressing either flips
  both buttons + the status pill.
- Orange "Bucket List" pill rendered inside `#mapLayerToggleBtn` under
  the map name whenever `settings.bucketListView` is on (sticky across
  reloads; pill is the visibility guardrail).
- Activation snapshots `{ levelFilter, matchNotes }` to
  `settings.bucketListFilterSnapshot`, scopes the level filter to the
  bucket-list level, turns Match Notes on. Deactivation restores from
  snapshot exactly. Activation guard with toast if no level is eligible;
  self-heal at `syncBucketListUi()` if the flagged level disappears.
- Orange highlights across legend swatch (`.legend-item.is-bucket-list`),
  map regions (`.state-tile.is-bucket-target`,
  `.world-tile.is-bucket-target`), pins
  (`.map-location-marker.is-bucket-target .marker-ring`), and Notes rows
  (`.compact-note-row.is-bucket-target`) — all scoped to
  `html[data-bucket-mode="on"]`.
- Quick Add defaults to the Bucket List level while the mode is on.
- Per-row "Mark Visited" promote action on Bucket List notes opens the
  editor pre-filled with `levelId: "visited"` + today's date (only if
  blank) via `openNoteDialog(id, { promoteBucketVisited: true })`;
  cancel preserves the original.
- Markdown / RTF / Plain Text exports gained a Bucket List section
  (omitted when empty); JSON unchanged. Helper:
  `bucketListExportEntries()`.

Prior:

4.0.0 "Trail Atlas" — World / Country map (WISH-001). It covers:

- A second map layer: "World Map" toggle in the map header (`#mapLayerToggleBtn`) flips between `#stateMap` and the embedded `#worldMap`; `settings.activeLayerId` persists.
- World SVG: optimized BlankMap-World.svg embedded as `#worldMap` (~820 KB). Source files kept in `assets/` (`world-map_raw.svg`, `world-map.svg`, `optimize-world-svg.py`).
- Layer seam: `MAP_LAYERS`, `activeLayerId`, `activeRegionStore`, `activeRegionCodes`, `regionName`, `isValidRegion`, `notesStoreForCode`, `regionStoreForCode`. US territories are a shared subset (level + notes in the US store on both maps).
- Storage: new `state.world { regions, notes }` bucket (ISO-2 keys) + `countriesSeeded`; US `state.states`/`state.notes` unchanged. Old saves migrate cleanly.
- Countries default to Not Interested (seeded once); the Not Interested level recolored `#111111` → `#9ca3af` (with legacy migration). Legend/stats, notes panel/search, and pins all scope to the active layer.
- Notes work for countries (editor/list/pins); pins anchor on the largest sub-shape (mainland). Exports (MD/RTF/text) gained a Countries section; JSON carries `world`.
- Completed-roadmap cleanup: removed WISH-001. Seeded WISH-054 (historical countries). New "country" location type.

Prior: 3.3.0 "Basecamp Notes" (toolbar scratchpad). 3.2.0 "Trail Shorthand".

Known follow-ups (not blocking): a higher-fidelity world SVG, historical countries (WISH-054), and per-country pin coordinates for finer placement.

## UX Preferences

- Compact, practical, map-first.
- Mix of Travel, Outdoorsy, Geeky Vibe.
- Avoid airy marketing UI.
- Desktop main view should stay viewport-locked above 980px; Notes scroll internally.
- Mobile/tablet keeps single-column page scroll below 981px.
- Settings dialog should have one scroll surface: `.dialog-body`.
- Help Center stays searchable and focused.
- Public release notes describe user-facing features.
