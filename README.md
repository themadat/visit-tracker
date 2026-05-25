# Trail Log

Trail Log is a local-first travel map for marking where you've been, where you want to go next, and the little memories worth keeping along the way. It started as a US state visit tracker and now layers in DC, territories, custom legend levels, location notes, icon tags, mapped memories, and copy-friendly exports, all with a slightly outdoorsy, geeky vibe.

The app is still intentionally simple to run: one offline-capable `index.html`, plain HTML/CSS/JavaScript, browser localStorage, JSON import/export, and no backend. Optional coordinate lookup only goes online when you tap Locate; saved data and manual coordinates keep working offline.

## Current Release

| Version | Date | Title | Summary
|---|---:|---|---|
| 3.1.0 | 2026-05-25 | Trail Echoes | Faster note entry with saved field suggestions and weekday-aware date parsing. |
| 3.0.0 | 2026-05-25 | Meet Trail Log | A place to track where you've been, where you're going, and log memories with an outdoorsy, geeky vibe. |
| 2.5.0 | 2026-05-23 | Legend Gets Legs | A Legend-focused release that makes levels easier to edit, reorder, position, and scan. |
| 2.4.0 | 2026-05-22 | Polish, Memory, and Mobile Flow | A cleanup release for saved layout state, Notes filtering and summaries, Location Tag settings, Roadmap counts, and What's New polish. |
| 2.3.0 | 2026-05-21 | Map Goes Places | A map-focused release with scrollable pan/zoom, cleaner fit controls, better mobile header behavior, and sharper map-control shortcuts. |
| 2.2.1 | 2026-05-21 | Readable Road | A small patch release for the Text Size slider and readability tuning. |
| 2.2.0 | 2026-05-19 | Tag, You're It | Faster note entry, configurable icon tags, a bigger searchable icon catalog, and a resizable Notes workspace. |
| 2.1.0 | 2026-05-17 | Notes Layout Polish | A focused Notes release with better scanning, sticky groups, clearer hierarchy, and cleaner copy-ready text. |
| 2.0.0 | 2026-05-16 | Major Notes Upgrade | Richer visit notes, smarter search and views, release notifications, and a more copy-ready notes workflow. |
| 1.13.0 | 2026-05-16 | Release Notes, Help, and Shortcut Polish | A focused release for faster release-note access, a clearer Help Center, tighter map controls, cleaner roadmap defaults, and more useful Developer Tools. |
| 1.12.0 | 2026-05-16 | Developer Mode and Map Label Tuning | A hidden Developer Tools mode with one-key Shortcut Mode and a drag-to-position map label tool, plus simpler hardcoded label positions, suggestions on by default, and a notes-panel detail fix. |
| 1.11.0 | 2026-05-16 | Hints, Legend, and Mobile Polish | A focused refinement release for dismissible guidance, cleaner legend controls, mobile Settings fit, and screenshot-friendly map behavior. |
| 1.10.0 | 2026-05-16 | Visitor's Center | [Visit Tracker] The app got a new name, a new layout, four ways out, and a Help Center that actually helps. |
| 1.9.0 | 2026-05-14 | Roadmap Pit Crew | Made roadmap planning, release notes, map controls, and notes scrolling easier to scan without losing detail. |
| 1.8.0 | 2026-05-14 | Icon Tailor Shop | Polished Settings, dialogs, labels, SF-style iconography, and display order. |
| 1.7.0 | 2026-05-11 | Counting What Counts | Added explicit stat behavior and visual treatment for legend levels. |
| 1.6.0 | 2026-05-11 | Pocket Map Mode | Improved mobile map viewing and small-screen density. |
| 1.5.0 | 2026-05-11 | Labels, Lands, And Little Islands | Expanded the map and made labels and notes easier to scan. |
| 1.4.0 | 2026-05-11 | Control Room Renovation | Reworked the main interface around notes, shortcuts, exports, and flexible dates. |
| 1.3.0 | 2026-05-10 | Drawer Drama, Resolved | Polished state selection, stats, and destructive actions. |
| 1.2.0 | 2026-05-10 | Legend Has It | Made visit levels easier to order, color, and understand. |
| 1.1.0 | 2026-05-10 | Real Map Energy | Upgraded the tracker from a grid into a richer map experience. |
| 1.0.0 | 2026-05-10 | First Pin On The Map | [US State Visit Map] Launched the offline state visit tracker. |

## Quick Start

### Run the app

Open the app directly:

```sh
open index.html
```

Or serve it locally for browser testing:

```sh
python3 -m http.server 8018
```

Use port `8018` by convention so smoke-test startup and cleanup stay predictable. If that port is occupied, use the next nearby port, note it, and stop the server when checks are done.

Then visit:

```text
http://127.0.0.1:8018/index.html
```

### Build the icon assets (optional, macOS only)

The repo ships with the generated PNG icons and the dual-theme `favicon.svg` already committed at the root, so day-to-day work needs no build. Run the build script only after editing the two source SVGs in `icon/`:

```sh
./build/generate-icons.sh
```

Inputs:

- `icon/trail-log-light.svg` — light variant of the brand icon (mint background, brown book, gold globe ring).
- `icon/trail-log-dark.svg` — dark variant (pine background, tan book, forest globe ring).

The script writes ten PNGs at the repo root (`apple-touch-icon[-dark].png`, `icon-{192,512}[-dark].png`, `favicon-{16,32}[-dark].png`) using `qlmanage` from QuickLook. It then invokes `build/generate-favicon.py` (Python 3, no third-party deps) to combine both palettes into a single `favicon.svg` that swaps fills via `@media (prefers-color-scheme: dark)`.

If `qlmanage` hangs (the QuickLook daemon occasionally wedges), reset it with:

```sh
killall -9 QuickLookUIService quicklookd
./build/generate-icons.sh
```

Commit the regenerated PNGs and `favicon.svg` alongside any SVG source edits.

## Repo Layout

```text
index.html             Complete app: markup, styles, inline SVG map, app state, and UI logic.
README.md              Developer notes (this file).
manifest.webmanifest   PWA manifest (light icon set).
manifest-dark.webmanifest  PWA manifest (dark icon set).
favicon.svg            Browser-tab favicon, light + dark via @media.
apple-touch-icon*.png  iOS / macOS home-screen and dock icons (light + dark).
icon-*.png             Manifest icons at 192 and 512, light and dark.
favicon-*.png          Legacy 16 / 32 favicon fallbacks, light and dark.
build/                 Optional macOS icon build pipeline (generate-icons.sh + generate-favicon.py). Excluded from deploys.
icon/                  Source SVGs the build pipeline consumes. `trail-log-{light,dark}.svg` are also fetched at runtime by the Install dialog's icon-picker thumbnails, so this folder ships with the deploy.
context/               LLM handoff context for future development sessions. Excluded from deploys.
.github/workflows/     GitHub Actions; deploys main to /visit-tracker/ and 3-0-0-Trail-Log to /visit-tracker/beta/. Excluded from deploys.
```

## App Architecture

The app is organized as one self-contained document:

- CSS lives in the `<style>` block and uses CSS variables for light/dark themes.
- Static HTML contains the app shell, dialogs, settings, documents, notes, and inline SVG map.
- JavaScript uses a small head boot script for install icons plus the main app `<script>` with centralized state and render functions.
- State is persisted with `localStorage` under `STORAGE_KEY = "usStateVisitMap.v1"`.
- App version is controlled by `APP_VERSION`.

Useful code regions in `index.html`:

- Constants: `APP_VERSION`, `STORAGE_KEY`, `STATES`, `BUILT_INS`, `THEMES`, `WISHLIST_SEEDS`, `CHANGELOG`
- Persistence: `defaultState`, `loadState`, `normalizeState`, `save`
- Map behavior: `initMap`, `handleStateTap`, `cycleState`, `renderMap`, `renderLocationMarkers`, `bindMapPanZoom`, `setMapZoom`, `toggleMapFitMode`
- Legend: `renderLegend`, `moveLevel`, `deleteLevel`, `smartApplyPalette`, `setLegendPosition`
- Notes: `renderNotesPanel`, `openNoteDialog`, `lookupNoteCoordinates`, `saveNoteFromForm`, note sorting/filter helpers
- Settings/import/export: `renderSettingsControls`, `exportMarkdown`, `exportRichText`, `importJson`

Current persisted settings include map layout state such as `mapSplitRatio`, `legendPosition`, `mapViewMode`, `mapZoom`, `mapPanCenter`, visible panels, selected Notes location, Notes sort/view/grouping/filter choices, and collapsed Notes categories.

## Current 3.1 Development Surface

Since `3.0.0`, the active work has focused on faster note entry and date parsing polish:

- Note editor Where Specifically, What For, and Who With fields suggest saved note values locally while typing.
- Suggestion lists prioritize the active note target before older values from other locations.
- Flexible date parsing accepts weekday names/abbreviations beside year-only, month-year, numeric, and month-name dates.
- Smart Convert removes weekday-adjacent date phrases cleanly instead of leaving weekdays behind in Additional Details.
- The note editor date preview pill shows weekday brackets like `[Fri]` for full dates.
- Accepted note date formats include `YYYY`, `M/YYYY`, `M/D/YYYY`, `M/D/YY`, `Month YYYY`, and `Month D YYYY`; weekdays are optional.

## Persistence and Migration

Keep saved-data compatibility as a first-class constraint. Existing users may already have custom levels, notes, colors, settings, and wishlist entries in localStorage.

When changing the data shape:

1. Add new defaults in `defaultState`.
2. Merge or repair old saved data in `normalizeState`.
3. Do not overwrite existing user-created arrays or settings unless the user explicitly resets.
4. For every completed change, bump the fourth `APP_VERSION` number and update `CHANGELOG` using the release-note format below.
5. If changing built-in roadmap items, bump `WISHLIST_SEED_VERSION`; append missing seeds and refresh existing `seed-*` entries by ticket ID without overwriting user-created entries.

## Roadmap Format

Roadmap items live in `WISHLIST_SEEDS` and render in the Roadmap tab.

- Target is either `targetKind: "exact"` with `targetVersion`, or a release bucket: `major`, `minor`, or `patch`.
- Priority values are `P0`, `P1`, `P2`, `P3`; effort values are `small`, `medium`, `large`, `x-large`.
- Title should be a human-readable summary.
- Description should state behavior and scope, without wandering.
- Cost is `tokenCostPct`, an estimated implementation-token share.
- Prompt is a compact implementation prompt for an LLM. Minimum useful tokens wins.
- When adding roadmap items, ask concise clarifying questions with default answers the user can accept unchanged.

## Development Guidelines

- Keep the app single-file unless there is a strong reason not to.
- Prefer small, readable functions over new abstractions.
- Preserve manual edits in `index.html`; do not reformat the whole file.
- Use semantic HTML and accessible labels for new controls.
- Use CSS variables for theme-aware colors.
- Keep destructive actions behind confirmations.
- Keep all features offline and local-only.
- Update this README and `context/LLM_HANDOFF.md` when a change affects development rules, repo context, or future handoff instructions.

## Manual QA Checklist

Run these after meaningful changes:

1. Parse check:

```sh
node -e "const fs=require('fs'); const html=fs.readFileSync('index.html','utf8'); const scripts=[...html.matchAll(/<script>([\\s\\S]*?)<\\/script>/g)].map(m=>m[1]); new Function(scripts.at(-1)); console.log('main script parses');"
```

2. Whitespace check:

```sh
git diff --check
```

3. Browser smoke test:

- Load the app through a local server.
- Use port `8018` by default; if occupied, use the next nearby port and stop the server after checks.
- On desktop, confirm the main page does not vertically scroll and the Notes panel content scrolls internally to the map bottom without stretching note rows/cards.
- Confirm the map renders and every visible state is clickable.
- Mark a state, open Notes, add/edit/delete a note.
- Try year-only, month/year, and full-date note entries.
- Toggle Notes sort/view controls.
- Add a note with Where Specifically, use Locate when online, confirm latitude/longitude fields save, then reload and confirm a map marker appears.
- Toggle Settings date format options.
- Apply a smart color palette.
- Export JSON, Markdown, and Simple Rich Text.
- Import a JSON backup only after confirming overwrite behavior.

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
- Mention any known manual QA gaps in the handoff.
- Give me a push commit summary and description in two distinct containers that make copy and paste very easy.

## Notes
SEE SCRATCHPAD
Contains Color Notes, rejected/backup svgs, amongst other stuff.
