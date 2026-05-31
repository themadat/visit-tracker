# LLM Handoff

Copy this into new chats:

```text
Continue work in /Users/stripes/Documents/GitHub/visit-tracker. Read context/LLM_HANDOFF.md first. Respect manual edits. Run git status --short before editing. Use port 8018 for local preview.
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
- Current version: `APP_VERSION = "4.1.0"` — 4.1.0 "Wayfinder" is the latest cut release (semantic version, no build segment). No active development line; open a new one when the next change starts (e.g. `4.1.0.1` or `4.1.1.1`) with a fresh `CHANGELOG` entry.
- Latest public releases (newest first): 4.1.0 "Wayfinder", 4.0.0 "Trail Atlas", 3.3.0 "Basecamp Notes", 3.2.0 "Trail Shorthand". Full notes in the in-app CHANGELOG.
- Historical plans (reference only — shipped):
  - `context/WISH-001-COUNTRY-MAP-PLAN.md` (US ⇄ World layer architecture from 4.0.0)
  - `context/WISH-036-BUCKET-LIST-PLAN.md` (Wayfinder level role + quick-switch mode from 4.1.0)
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
  settings: {
    ..., activeLayerId, mapLabels,
    selectedState, notesPanelState, collapsedNoteCategories, legendPosition,
    bucketListView, bucketListFilterSnapshot   // Wayfinder mode + snapshot
  },
  levels: [{ id, name, definition, color, countsTowardStats, isBucketList }],
  visitTypes: [{ id, label, icon, shortcut, enabled, searchTags }],
  states: { CA: ["visited"] },                 // US states + territories
  notes: { CA: [{ id, date, levelId, city, where, what, who, lat, lng, geocodeLabel, details, text, visitTypes }] },
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
- Saved Notes filters are repaired against current level/tag ids.
- Selected-location Notes detail ignores main-list filters.
- Match Notes map filtering follows active Notes filters.
- Selecting an excluded-from-stats legend level auto-enables Show Excluded;
  turning Show Excluded off drops excluded-level pills from the active filter.
- Map zoom mutations (button / keyboard / wheel / reset / fit toggle) must
  flow through `syncMapZoomReadout()` so the `#mapZoomReadout` value and the
  zoom button enable states stay in sync.

## Current Surface

- Map: SVG state/territory map + world map; layer toggle (`#mapLayerToggleBtn`); scroll/fit modes, pan/zoom persistence, labels, clustered note pins, Match Notes filtering. Wayfinder pill rides inside the layer toggle when active.
- Legend: editable levels (name, color, definition, exclude-from-stats, Wayfinder), drag reorder, swipe quick actions, movable desktop placement.
- Notes: search (with `/` hint chip + universal `/` shortcut), sort, compact/expanded/text views, category grouping, icon filters, Show Excluded toggle (styled like legend's excluded pattern), coordinate filter, date precision filter, selected-location detail.
- Note editor: Quick Add, City/Where/What/Who/Details, local field suggestions, Smart Convert, partial/flexible dates, weekday preview, manual/lookup coordinates, multiple icon tags. Quick Add defaults to the Wayfinder level when Wayfinder Mode is on.
- Location Icon Tags: configurable active tags plus auto-discovered More Icons from `__*_CIRCLE` constants, generated labels/search tags, explicit aliases, aliased-first sorting.
- Wayfinder: per-row "Mark Visited" promote action on Wayfinder notes (`openNoteDialog(id, { promoteBucketVisited: true })`) opens the editor pre-filled with `levelId: "visited"` + today's date when blank.
- Help / What's New / Roadmap / Developer Tools (with grouped Keyboard Shortcuts Reference at `#keyboardShortcutsReference`) live under Settings tabs.
- Exports: JSON, Markdown, RTF, Plain Text — MD/RTF/Text gain a Countries section (when engaged) and a Wayfinder section (when engaged); helper: `bucketListExportEntries()`.

## UX Preferences

- Compact, practical, map-first.
- Mix of Travel, Outdoorsy, Geeky Vibe.
- Avoid airy marketing UI.
- Desktop main view should stay viewport-locked above 980px; Notes scroll internally.
- Mobile/tablet keeps single-column page scroll below 981px.
- Settings dialog should have one scroll surface: `.dialog-body`.
- Help Center stays searchable and focused.
- Public release notes describe user-facing features.
