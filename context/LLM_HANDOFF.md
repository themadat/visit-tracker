# LLM Handoff

Copy this into new chats:

```text
Continue work in /Users/stripes/Documents/GitHub/visit-tracker. Read context/LLM_HANDOFF.md first. Respect manual edits. Run git status --short before editing. Use port 8018 for local preview. Current development line is Trail Log 3.2.0.
```

## Release Notes

For every completed change:

- Bump the fourth `APP_VERSION` build number.
- When finalizing a release, set `APP_VERSION` to the released semantic version and collapse same-line patch/build notes into that release entry.
- Update `CHANGELOG` using the collapsed release-note format: `Major.Minor.Patch :: YYYY-mm-dd :: Cheeky theme name`, then a bold one-line summary, then `highlights` and `updates`.
- Keep `highlights` short and abbreviated; use `updates` for the fuller, denser change list.
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
- Current development version: `APP_VERSION = "3.2.0.0"`
- Latest public release: Trail Log 3.1.0
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
  settings: { theme, tapBehavior, buttonStyle, uiHints, textScale, dateOrder, dateStyle, mapLabels, mapSplitRatio, mapViewMode, mapZoom, mapPanCenter, mapPanelOpen, legendPanelOpen, notesPanelOpen, notesSortMode, notesViewMode, notesCategoricalMode, notesHideExcludedOnly, notesDatePrecisionFilter, notesCoordinateFilter, noteLevelFilters, noteVisitTypeFilters, selectedState, notesPanelState, collapsedNoteCategories, legendPosition },
  levels: [{ id, name, definition, color, countsTowardStats }],
  visitTypes: [{ id, label, icon, shortcut, enabled, searchTags }],
  states: { CA: ["visited"] },
  notes: { CA: [{ id, date, levelId, city, where, what, who, lat, lng, geocodeLabel, details, text, visitTypes }] },
  territoryDefaultsSeeded
}
```

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

3.1.0 "Trail Echoes" is cut. It covers:

- Saved City/Where/What/Who suggestions.
- Broader flexible date parsing and weekday date preview.
- City/Where editor behavior and mapped-location status polish.
- Date picker layout polish.
- Richer Location Icon Tag aliases and aliased-first sorting.
- Persisted Notes date precision filter.
- Match Notes map filtering updates.
- Completed-roadmap cleanup.

## UX Preferences

- Compact, practical, map-first.
- Mix of Travel, Outdoorsy, Geeky Vibe.
- Avoid airy marketing UI.
- Desktop main view should stay viewport-locked above 980px; Notes scroll internally.
- Mobile/tablet keeps single-column page scroll below 981px.
- Settings dialog should have one scroll surface: `.dialog-body`.
- Help Center stays searchable and focused.
- Public release notes describe user-facing features.
