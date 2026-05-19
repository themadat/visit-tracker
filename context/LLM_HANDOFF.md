# LLM Handoff

Load this before editing the repo.

## Repo In 10 Seconds

US State Visit Map is a single-file, offline HTML/CSS/JS app for tracking visits to US states, DC, and territories. Main code is `index.html`. Source SVG icons live in `ICON/`. User data is browser localStorage. No build step, backend, dependencies, or network calls.

Current anchors:

- `APP_VERSION`: `2.2.0.8`
- storage key: `usStateVisitMap.v1`
- roadmap/wishlist is developer-facing seed data only; do not persist user roadmap data in backups.

## Critical Constraints

- Manual edits are authoritative. Treat uncommitted changes and unexpected diffs as intentional user work.
- Do not overwrite, revert, rename, reformat, normalize, or "clean up" existing edits unless the current request explicitly asks for it.
- If a requested change overlaps user-edited code, make the smallest compatible patch and preserve surrounding edits.
- When manual or unexpected edits are detected, determine what changed and include their tracked app/docs effects in `CHANGELOG` alongside the current update.
- If ownership of a change is unclear, leave it untouched or ask before modifying.
- Run `git status --short` before editing.
- Edit `index.html` surgically; do not reformat the whole file.
- Keep the app single-file/offline unless explicitly asked otherwise.
- New persisted field: update `defaultState()` and `normalizeState()`.
- Every completed change: bump fourth `APP_VERSION` number and update `CHANGELOG`.
- When finalizing a release, set `APP_VERSION` to the released semantic version, collapse same-line patch/build notes into that release entry, and update Help Center plus dismissible hints wherever user-facing behavior, controls, workflows, or terminology changed.
- Update `README.md` and `context/LLM_HANDOFF.md` when a change affects repo rules, architecture, workflow, or handoff context.
- Changelog wording must be public-safe: describe features and changes, not internal tickets, prompts, or workflow mechanics.
- Roadmap items use P0-P3 priority, small/medium/large/x-large effort, exact-or-bucket target, scoped description, token cost %, and a terse LLM prompt.
- When adding roadmap items, ask concise clarifying questions with default answers the user can approve unchanged.
- Roadmap seed migrations may refresh existing `seed-*` items by ticket ID, but must not overwrite user-created roadmap entries.
- Destructive UI actions go through `requestConfirm(...)`.

## Fast Search

```sh
# orientation
rg -n "APP_VERSION|STORAGE_KEY|WISHLIST_SEED_VERSION|CHANGELOG|WISHLIST_SEEDS" index.html

# persistence
rg -n "function defaultState|function loadState|function normalizeState|function save" index.html

# map
rg -n "function initMap|function handleStateTap|function renderMap|function renderMapLabels|toggleMapFitMode" index.html

# legend / notes / settings
rg -n "function renderLegend|function renderNotesPanel|function renderSettingsControls|function bindEvents|function handlePowerShortcut" index.html
```

## Runtime Shape

```text
state = loadState()
init()
  initMap()
  bindEvents()
  render()
```

Change state, call `save()` when persistence is needed, then `render()` or the narrow render function used nearby.

## State Contract

```js
{
  appVersion, mapName,
  settings: { theme, tapBehavior, buttonStyle, uiHints, dateOrder, dateStyle, mapLabels, mapSplitRatio },
  levels: [{ id, name, definition, color, countsTowardStats }],
  visitTypes: [{ id, label, icon, shortcut, enabled, searchTags }],
  states: { CA: ["visited"] },
  notes: { CA: [{ id, date, levelId, where, what, who, details, text, visitTypes }] },
  territoryDefaultsSeeded
}
```

Invariants: level order controls map color; `levels` max is 5; state level IDs must exist; dates normalize to `YYYY`, `YYYY-MM`, or `YYYY-MM-DD`; `visitTypes` may contain multiple known ids and `state.visitTypes` stores the configurable label/order/shortcut/enabled/search-tag setup; `settings.mapSplitRatio` stores the desktop map/cards divider position and defaults to `0.66`; new default note tags enable First, Favorite, Memorable, Flagged, and Home while preserving saved tag customizations; opt-out levels do not count toward completion; territories seed once.

## Product Surface

Clickable SVG map; resizable desktop map/cards split; map labels none/abbr/name; editable legend levels/colors/stats; notes search/filter/sort/compact/expanded plus active icon filter strip with a leftmost no-icon filter and permanent filter summary; settings for theme/buttons/hints/tap/date/import/export and compact draggable icon-tag curation; developer JSON tree mirrors full export data with large collections collapsed; JSON/Markdown/RTF export; JSON import; shortcut overlay via Shift + Option + Control/Command.

UX taste: compact, practical, map-first, light personality in docs/release copy. Avoid airy marketing-style UI.

## User Preference Memory

- Desktop main view is viewport-locked above 980px: app/body do not vertically scroll, the map column is height-limited, and Notes panel content scrolls internally to align with the map bottom without stretching note rows/cards.
- Desktop map/cards split can be manually resized with the divider; preserve `settings.mapSplitRatio` and default unset/old values to a 66/33 map-to-cards split.
- Mobile/tablet keeps the single-column page scroll below 981px.
- Hints should become individually dismissible; global hints toggle overrides all.
- Settings uses compact category sections; parent headings should stay visually stronger than row-level setting labels.
- Settings dialog uses one intended scroll surface: keep `#settingsDialog` grid-bounded and let `.dialog-body` own vertical scrolling.
- Import/export buttons equal-sized and space-efficient.
- Help + FAQ should become Help Center with search.
- Changelog + roadmap should become What's New.
- Public release notes describe features, not internal tickets/prompts/wishlist mechanics.
- Collapse build-level changelog entries into major.minor release entries, then update Help Center and dismissible hints for the same user-facing changes before calling the release cut done.
- Changelog format: `Major.Minor.Patch :: YYYY-mm-dd :: cheeky theme name`, then a bold one-line summary, then short `highlights` and denser `updates`.

## Verify

```sh
node -e "const fs=require('fs'); const h=fs.readFileSync('index.html','utf8'); const js=h.match(/<script>([\s\S]*)<\/script>/)[1]; new Function(js); console.log('script parses');"
git diff --check
python3 -m http.server 8018
```

Open `http://127.0.0.1:8018/index.html` for smoke testing.
Use port `8018` by default for local smoke checks so startup and cleanup stay predictable. If it is occupied, use the next nearby port, say which one, and stop the server before the final response.
