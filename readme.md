# US State Visit Map

Single-file, offline-capable HTML app for tracking US state visits. The app is intentionally plain HTML, CSS, and JavaScript with no build step, backend, or external services.

## Quick Start

Open the app directly:

```sh
open index.html
```

Or serve it locally for browser testing:

```sh
python3 -m http.server 8018
```

Then visit:

```text
http://127.0.0.1:8018/index.html
```

## Repo Layout

```text
index.html   Complete app: markup, styles, inline SVG map, app state, and UI logic.
readme.md    Developer notes.
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
- Map behavior: `initMap`, `handleStateTap`, `cycleState`, `renderMap`
- Legend: `renderLegend`, `moveLevel`, `deleteLevel`, `smartApplyPalette`
- Notes: `renderNotesPanel`, `openNoteDialog`, `saveNoteFromForm`, note sorting/filter helpers
- Settings/import/export: `renderSettingsControls`, `exportMarkdown`, `exportRichText`, `importJson`

## Persistence and Migration

Keep saved-data compatibility as a first-class constraint. Existing users may already have custom levels, notes, colors, settings, and wishlist entries in localStorage.

When changing the data shape:

1. Add new defaults in `defaultState`.
2. Merge or repair old saved data in `normalizeState`.
3. Do not overwrite existing user-created arrays or settings unless the user explicitly resets.
4. Bump `APP_VERSION` and add a `CHANGELOG` entry.
5. If adding built-in wishlist items, bump `WISHLIST_SEED_VERSION` and add migration-safe logic that only appends missing seed entries.

## Development Guidelines

- Keep the app single-file unless there is a strong reason not to.
- Prefer small, readable functions over new abstractions.
- Preserve manual edits in `index.html`; do not reformat the whole file.
- Use semantic HTML and accessible labels for new controls.
- Use CSS variables for theme-aware colors.
- Keep destructive actions behind confirmations.
- Keep all features offline and local-only.

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
- Confirm the map renders and every visible state is clickable.
- Mark a state, open Notes, add/edit/delete a note.
- Try year-only, month/year, and full-date note entries.
- Toggle Notes sort/view controls.
- Toggle Settings date format options.
- Apply a smart color palette.
- Export JSON, Markdown, and Simple Rich Text.
- Import a JSON backup only after confirming overwrite behavior.

## Release Notes

For each user-facing change:

- Update `APP_VERSION`.
- Add a `CHANGELOG` entry with concise notes.
- Preserve the localStorage schema where possible.
- Mention any known manual QA gaps in the handoff.

