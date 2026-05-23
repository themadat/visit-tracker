# Trail Log

Single-file, offline-capable HTML app for tracking US state visits and mapped visit notes. The app itself is plain HTML, CSS, and JavaScript with no required build step or backend. An optional macOS-only build script regenerates the PNG and SVG icon assets from the two source SVGs in `icon/`. Optional coordinate lookup uses an online geocode request only when the user taps Locate; saved data and manual coordinates work offline.

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
- JavaScript lives in one `<script>` block and uses centralized state plus render functions.
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

## Current 3.0 Development Surface

Since `2.5.0`, the active work has focused on branding, app install polish, tips, and mapped note locations:

- Trail Log branding now reaches the title, default map name, README, Settings footer, app icon, favicon, and manifest.
- The title-bar app icon owns the hidden quad-tap hint/banner reset gesture.
- Optional Tip Jar controls use a compact local dialog and Venmo handoff without SDKs or trackers.
- Notes can store latitude/longitude, use an optional online Locate lookup, and accept manual coordinate overrides.
- Coordinate-backed notes render as clustered markers on the map; the first saved location/icon represents each cluster, and grouped markers can zoom in or open a note picker.
- Location coordinates persist in localStorage and JSON backups and appear in text exports/search.

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
node -e "const fs=require('fs'); const html=fs.readFileSync('index.html','utf8'); const js=html.match(/<script>([\\s\\S]*)<\\/script>/)[1]; new Function(js); console.log('script parses');"
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

<!-- 70% <g transform="translate(228 164) scale(21)"> -->
<!-- 80% <g transform="translate(177 112) scale(24.77)"> -->
<comment name="PineShadow" fill="#243127" />
<comment name="PineMist" fill="#D6E7D8" />
<comment name="DeepLeatherBrown" fill="#5A3E2B" />
<comment name="WarmSaddleBrown" fill="#8B5E3C" />
<comment name="TrailDustTan" fill="#B79B7A" />
<comment name="Aged PaperCream" fill="#E8DCC8" />
<comment name="ForestGreene" fill="#355E3B" />
<comment name="MossGreen" fill="#6B8F4E" />
<comment name="CompassGold" fill="#C2A15A" />
<comment name="BrightAdventureGold" fill="#D4AF37" />
<comment name="SunlitGold" fill="#E0B84F" />
<comment name="AmberGold" fill="#E3A93B" />
<comment name="BrightCompassGold" fill="#F2C14E" />

## Future Prompts


