# LLM Handoff

Copy this into new chats:

```text
Continue work in /Users/stripes/Documents/GitHub/visit-tracker. Read context/LLM_HANDOFF.md first. Respect manual edits. Run git status --short before editing. Use port 8018 for local preview.
```

Shorthand commands: **`start`**, **`prep`**, **`ship`** — see Workflows below.

## Workflows: `start` / `prep` / `ship`

Three shorthand commands drive the version lifecycle: `start` opens a line,
`prep` makes it release-ready, `ship` condenses it into a cut release. Always
run `git status --short` first and preserve in-flight manual edits. End every
working session with a push commit summary + description in two distinct
copy-paste containers, then finish with one copyable checkpoint command:
`` `_vt-checkpoint <short commit message>` ``.

### `start` — open a new version line

Begin a plan, or implement a specific feature.

- Read the Snapshot for the latest cut release and any active dev line.
- Pick the mode:
  - **Plan**: write `context/WISH-<id>-<slug>-PLAN.md` capturing scope,
    constraints, data-model/schema changes, phasing, and open questions.
    Planning-only edits need no `APP_VERSION`/`CHANGELOG` churn.
  - **Implement**: open the line by bumping `APP_VERSION` to a fresh build
    (e.g. `4.2.0` → `4.2.1.1`, or a new minor `4.3.0.1`) and starting a new
    `CHANGELOG` entry with a working (cheeky, on-theme) title. Bump the fourth
    build number for each subsequent change on the line.
- If the feature matches a `WISHLIST_SEEDS` ticket, reference it by `WISH-###`
  and set/retarget its `targetVersion`.
- New persisted fields: add defaults in `defaultState()` and repair in
  `normalizeState()`; preserve the `usStateVisitMap.v1` schema.
- Verify before finishing (main script parses + the new flow works).

### `prep` — get the version release-ready

Polish every user-facing surface for the in-progress build line. Do **not**
collapse the build entries, drop the `.N` build segment, or create the final
release cut yet — that is `ship`.

- Inventory dirty files before editing. Treat manual changes as authoritative;
  fold their user-facing effect into the current release notes when relevant.
- Walk the line's shipped behavior and update everything that describes it:
  - **Help Center** entries and the **FAQ** (Settings → Help).
  - **Hints** and dismissable-hint copy (`data-hint` text + hint keys).
  - **What's New / release notice banner**: `notice.summary` ≤100 chars,
    themed `notice.cta` ending in `!`.
  - **Release notes** (`CHANGELOG`): highlights (≤4 bullets, ≤100 chars each)
    plus the dense `updates` list; keep wording public-safe (no tickets,
    prompts, or workflow mechanics).
  - **`README.md`** feature/surface list.
  - **Roadmap** `WISHLIST_SEEDS`: mark shipped items done / retarget versions.
  - **This handoff**: refresh Snapshot, Current Surface, invariants, and UX as
    needed, and condense it so it stays lean.
- Lock the release theme name and the final `notice.cta`.
- Verify the app parses and the new flows work. Leave the line in active-dev
  form (`APP_VERSION` still `x.y.z.N`) when prep is done.

### `ship` — condense the version (finalize the cut)

Collapse the dev build line into one released entry.

- Set `APP_VERSION` to the released semantic version, dropping the `.N` build
  segment (e.g. `4.2.0.27` → `4.2.0`).
- Collapse the active `CHANGELOG` entry's per-build notes into a single clean
  release: `Major.Minor.Patch :: YYYY-mm-dd :: Theme`, bold one-line summary,
  ≤4 highlights, dense `updates`. Sync `notice.version` to the cut version so
  release notice dismissal keys match the shipped release.
- Sync public surfaces one last time: `README.md` release/history table,
  Help/FAQ/hints, release notice copy, and any Roadmap shipped/retargeted state.
- Update the Snapshot's **Current version** and **Latest public releases**
  lines. Delete/retire in-flight plan docs from `context/` and remove active
  plan references from this handoff unless the user explicitly asks to keep a
  historical reference file.
- Run final verification: parse, `git diff --check`, preview on port 8018,
  smoke the shipped flows, stop the local server, then re-run
  `git status --short`.
- Leave no active dev line; the next change begins with `start`.

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
- Main file: `index.html`. `STORAGE_KEY = "usStateVisitMap.v1"`, version in `APP_VERSION`.
- Docs: `README.md` (public/run/build), this handoff (all dev + LLM context).
- Current version: `APP_VERSION = "4.3.0.4"` — active 4.3.0 dev line "Waypoint Pack" for WISH-004 Waypoint Packs. Latest cut release is 4.2.0 "Rangefinder".
- 4.3.0.4 adds **Waypoint Packs** as a Wayfinder sub-feature: curated place packs that can be previewed, prioritized, annotated, attached to existing notes, and batch-added as normal Wayfinder notes. National Parks and National Monuments are bundled packs, with pack-aware markers/labels, note metadata, priority badges/filter/sort, and export grouping. Pack markers do not recolor state progress. The Packs button only appears in Wayfinder, uses `__CIRCLE_BADGE_PLUS`, and opens an inset panel over Notes instead of a modal. Monument notes are prefilled with Date Established and Description from a static Wikipedia-sourced snapshot. Alaska waypoint projection has separate mainland/Aleutian frames, pack overlay pins are Wayfinder teal, and priority colors run green through orange.
- 4.2.0 adds **Rangefinder Mode**: a map mode (Shortcut Mode key `5`, `__TARGET` button) that picks two note pins as Start/End, draws concentric planning rings, and shows straight-line distance + estimated time. Drive/Plane travel modes, per-map settings (`settings.ringByLayer.{us,world}`), configurable average speed (Drive 30–120, Plane 120–760 mph), fill/clip/unit/time toggles, and US + World support. Internal symbols use the `ring*` prefix.
- Latest public releases (newest first): 4.2.0 "Rangefinder", 4.1.0 "Wayfinder", 4.0.0 "Trail Atlas", 3.3.0 "Basecamp Notes". Full notes in the in-app CHANGELOG; full history table in `README.md`.
- Plan docs live in `context/` only while their line is in flight, then are deleted on ship. Active: `context/WISH-004-national-park-overlay-PLAN.md` (revised Waypoint Packs plan). Shipped plans (Rangefinder 4.2.0, Wayfinder 4.1.0, World map 4.0.0) were removed after release.
- No build step (other than the optional macOS icon pipeline — see README), backend, or dependencies.
- User data lives in browser localStorage. Locate is the only intentional online action and only runs when clicked.

## Rules

**Process**

- Run `git status --short` before editing.
- Manual edits are authoritative. Preserve dirty work unless the user explicitly asks to revert it.
- Edit surgically, especially in `index.html`; do not reformat the file.
- App behavior changes usually require `APP_VERSION`/`CHANGELOG` updates. Docs-only, handoff-only, or planning-only edits do not need release churn unless the user asks.
- When a change affects dev rules, repo context, or future handoff instructions, update this file. Keep `README.md` for public/run/build info only — do not duplicate dev rules there.
- End every final reply with a short copyable checkpoint command in the exact format `` `_vt-checkpoint <message>` ``. This signals the prompt is done and lets the user run their local commit/push/beta update helper.

**Code**

- Keep the app single-file unless there is a strong reason not to. No build step, backend, or runtime dependencies.
- Prefer small, readable functions over new abstractions.
- Use semantic HTML and accessible labels for new controls; theme-aware colors via CSS variables.
- Keep all features offline and local-only. Destructive UI actions go through `requestConfirm(...)`.

**Persistence & migration** (saved-data compatibility is first-class)

- New persisted fields: add defaults in `defaultState()` and repair/defaulting in `normalizeState()`.
- Preserve the `usStateVisitMap.v1` schema. Never overwrite existing user-created arrays or settings unless the user explicitly resets.

**Roadmap (`WISHLIST_SEEDS`)** — developer-facing defaults only; never persisted in user backups.

- Item shape: `title`, `ticketId` (`WISH-###`), `description`, `priority`, `effort`, `targetKind`, `targetVersion`, `tokenCostPct`, `prompt`, `category`.
- `priority`: `P0`–`P3`. `effort`: `small` | `medium` | `large` | `x-large`.
- `targetKind`: `exact` (with a `targetVersion`) or a bucket — `major` | `minor` | `patch`.
- `description` states behavior and scope; `prompt` is a compact, minimal-token implementation prompt for an LLM.
- When adding items, ask concise clarifying questions with default answers the user can accept unchanged.

**Release notes** — keep public-facing: describe shipped behavior, not prompts, tickets, or internal workflow.

## Quick Commands

```sh
rg -n "APP_VERSION|STORAGE_KEY|WISHLIST_SEEDS|CHANGELOG" index.html
rg -n "function defaultState|function normalizeState|function save" index.html
rg -n "function renderNotesPanel|function renderMap|function bindEvents" index.html
git diff --check
python3 -m http.server 8018   # preview at http://127.0.0.1:8018/index.html; stop before final reply
```

## Code Map (`index.html`)

- Constants: `APP_VERSION`, `STORAGE_KEY`, `STATES`/`STATE_NAMES`, `BUILT_INS`, `THEMES`, `MAP_LAYERS`, `WISHLIST_SEEDS`, `CHANGELOG`.
- Persistence: `defaultState`, `loadState`, `normalizeState`, `save`.
- Map: `initMap`, `handleStateTap`, `cycleState`, `renderMap`, `renderLocationMarkers`, `renderRingOverlay`, `bindMapPanZoom`, `setMapZoom`, `toggleMapFitMode`.
- Legend: `renderLegend`, `moveLevel`, `deleteLevel`, `smartApplyPalette`, `setLegendPosition`.
- Notes: `renderNotesPanel`, `openNoteDialog`, `lookupNoteCoordinates`, `saveNoteFromForm`, plus sort/filter helpers.
- Settings/exports: `renderSettingsControls`, `exportMarkdown`, `exportRichText`, `importJson`.

## Verify

- **Parse check**: `node` is not guaranteed on this machine. Prefer serving on 8018 and watching the browser console for errors. If a JS engine is present, extract the last `<script>` and `new Function(...)` it (`node`, or macOS `jsc` at `/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc`). Pure helpers can be unit-tested in isolation with `jsc`.
- **Whitespace**: `git diff --check`.
- **Smoke test** (after meaningful changes): desktop main view doesn't vertically scroll (Notes scroll internally); map renders and states/countries are clickable; mark a region, add/edit/delete a note; year-only, month/year, and full-date entries; toggle Notes sort/view; add coordinates via Locate (online) then reload and confirm a map marker; toggle date-format settings; apply a smart palette; export JSON/Markdown/RTF; import only after confirming overwrite.
- Stop the local server before the final response.

## App Shape

Runtime flow: `state = loadState()` -> `init()` -> `initMap()` / `bindEvents()` / `render()`.

State basics:

```js
{
  appVersion, mapName,
  settings: {
    ..., activeLayerId, mapLabels,
    selectedState, notesPanelState, collapsedNoteCategories, legendPosition,
    bucketListView, bucketListFilterSnapshot,  // Wayfinder mode + snapshot
    ringMode, ringPanelSplitRatio, ringByLayer, // Rangefinder mode + per-map bags
    suggestedSetsVisible, activeSuggestedSetId,
    suggestedSetIcons, suggestedSetLabelModes
  },
  levels: [{ id, name, definition, color, countsTowardStats, isBucketList }],
  visitTypes: [{ id, label, icon, shortcut, enabled, searchTags }],
  states: { CA: ["visited"] },                 // US states + territories
  notes: { CA: [{ id, date, levelId, city, where, what, who, lat, lng, geocodeLabel, details, text, visitTypes, priority, sourceSetId, sourceItemId, sourceSetGenerated }] },
  world: { regions: { FR: ["visited"] }, notes: { FR: [ ... ] } },  // countries (ISO-2), territories stay in states/notes
  territoryDefaultsSeeded, countriesSeeded
}
```

Map layers: `MAP_LAYERS` (`us` | `world`) + runtime `activeLayerId`.
Region helpers resolve by active layer: `activeRegionStore`/`regionStoreForCode`
(level data), `notesStoreForCode` (notes; territories → US store on both maps),
`activeRegionCodes` (stats/list universe), `regionName`, `isValidRegion`,
`ensureWorldRegions` (lazy code/name scan from `#worldMap`).

Wayfinder (user-facing name; internal symbols kept as `BucketList` for schema
preservation): per-level `isBucketList` flag (only one, must be excluded from
stats). Helpers: `bucketListLevel()`, `bucketListLevelId()`,
`applyBucketListFlag()`, `setBucketListView()`, `syncBucketListUi()`,
`bucketListExportEntries()`. Mode toggles drive off `html[data-bucket-mode]`
(teal accents); CSS hooks include `.legend-item.is-bucket-list`,
`.state-tile.is-bucket-target`, `.world-tile.is-bucket-target`,
`.map-location-marker.is-bucket-target .marker-ring`,
`.compact-note-row.is-bucket-target`, plus the `.bucket-list-pill` that rides
inside `#mapLayerToggleBtn`. Activation snapshots `{ levelFilter, matchNotes,
hideExcluded }` to `settings.bucketListFilterSnapshot`, scopes filters to the
Wayfinder level, and restores from snapshot on deactivation.

Rangefinder (internal symbols use `ring*`): global `settings.ringMode` toggles
the mode, while `settings.ringByLayer.{us,world}` stores each map's Start/End,
ring distances, enabled rings, travel mode, units, fill/clip/time settings, and
Drive/Plane speeds. `settings.ringPanelSplitRatio` controls the paired
Legend/Rangefinder split when both panels share the map placement. Helpers
funnel through the active layer bag; legacy flat ring settings seed both bags
only when upgrading older saved data.

Keyboard shortcut layers (see Developer Tools → Keyboard Shortcuts Reference
for the full grouped list):

- **Universal**: fire on plain keypress without Shortcut Mode (skipped while
  typing). Lives in `handleUniversalShortcut`.
- **Shortcut Mode**: every primary button advertises its key via
  `data-shortcut`. Dispatch table in `handlePowerShortcut`.
- **Chord hints**: a few buttons advertise `⇧⌃⌥X`-style chords on their
  hints; chord behavior dispatches through the same Shortcut-Mode handler.

Important invariants:

- Dates normalize to `YYYY`, `YYYY-MM`, `YYYY-MM-DD`, or `""`.
- Coordinates are numbers or `""`.
- `levels` max is 5; level order controls map color.
- Only one level can be flagged `isBucketList: true`, and it must have
  `countsTowardStats: false`.
- `visitTypes` are configurable icon tags; shortcuts should stay unique among active tags.
- Waypoint Pack source metadata is optional on notes; normalize it against
  bundled `SUGGESTED_SETS` and drop unknown set/item ids on import/load.
- Waypoint Pack notes are normal notes. Batch add/attach updates managed fields
  and coordinates but must not recolor state progress automatically.
- `priority` is a note field (`"1"`-`"5"` or `""`), not a Location Icon Tag.
- Saved Notes filters are repaired against current level/tag ids.
- Rangefinder settings are repaired per layer. Ring arrays allow up to 8 rings;
  US and World settings remain independent after migration.
- Selected-location Notes detail ignores main-list filters.
- Match Notes map filtering follows active Notes filters.
- Selecting an excluded-from-stats legend level auto-enables Show Excluded;
  turning Show Excluded off drops excluded-level pills from the active filter.
- Map zoom mutations (button / keyboard / wheel / reset / fit toggle) must
  flow through `syncMapZoomReadout()` so the `#mapZoomReadout` value and the
  zoom button enable states stay in sync.

## Current Surface

- Map: SVG state/territory map + world map; layer toggle (`#mapLayerToggleBtn`); scroll/fit modes, pan/zoom persistence, labels, clustered note pins, Match Notes filtering. Wayfinder pill rides inside the layer toggle when active.
- Waypoint Packs: Wayfinder-only Packs button `#notesAddWaypointsBtn`
  (`__CIRCLE_BADGE_PLUS`) opens an inset panel over Notes, with National Parks
  and National Monuments bundled as the first packs. Notes header Wayfinder button is
  `#notesActivateWayfinderBtn`; both notes-header Wayfinder controls have teal
  outlines.
  Available Packs cards, visual icon choices, overlay and label icon controls,
  preview Include/Priority/Note cards, batch add into Wayfinder, attach existing
  notes, priority filter/sort, pack-aware markers, and safe remove behavior.
- Legend: editable levels (name, color, definition, exclude-from-stats, Wayfinder), drag reorder, swipe quick actions, movable desktop placement.
- Rangefinder: Shortcut Mode key `5` / target button opens a paired panel with the Legend, picks saved note pins as Start/End, draws straight-line Drive/Plane planning rings on US and World maps, and keeps per-map ring distances, units, fill/clip/time style, travel mode, and average speed settings.
- Notes: search (with `/` hint chip + universal `/` shortcut), sort, compact/expanded/text views, category grouping, icon filters, Show Excluded toggle (styled like legend's excluded pattern), coordinate filter, date precision filter, selected-location detail.
- Note editor: Quick Add, City/Where/What/Who/Details, local field suggestions, Smart Convert, partial/flexible dates, weekday preview, manual/lookup coordinates, multiple icon tags, priority, and Add to active pack. Quick Add defaults to the Wayfinder level when Wayfinder Mode is on.
- Location Icon Tags: configurable active tags plus auto-discovered More Icons from `__*_CIRCLE` constants, generated labels/search tags, explicit aliases, aliased-first sorting.
- Wayfinder: per-row "Mark Visited" promote action on Wayfinder notes (`openNoteDialog(id, { promoteBucketVisited: true })`) opens the editor pre-filled with `levelId: "visited"` + today's date when blank.
- Help / What's New / Roadmap / Developer Tools (with grouped Keyboard Shortcuts Reference at `#keyboardShortcutsReference`) live under Settings tabs.
- Exports: JSON, Markdown, RTF, Plain Text — MD/RTF/Text gain Countries, Wayfinder, and Waypoint Packs sections when engaged; Wayfinder exports group linked pack notes under their pack name. Helpers: `bucketListExportEntries()`, `suggestedSetExportEntries()`.

## UX Preferences

- Compact, practical, map-first.
- Mix of Travel, Outdoorsy, Geeky Vibe.
- Avoid airy marketing UI.
- Desktop main view should stay viewport-locked above 980px; Notes scroll internally.
- Mobile/tablet keeps single-column page scroll below 981px.
- Settings dialog should have one scroll surface: `.dialog-body`.
- Help Center stays searchable and focused.
- Public release notes describe user-facing features.
