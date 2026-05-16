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

Use port `8018` by convention so smoke-test startup and cleanup stay predictable. If that port is occupied, use the next nearby port, note it, and stop the server when checks are done.

Then visit:

```text
http://127.0.0.1:8018/index.html
```

## Repo Layout

```text
index.html   Complete app: markup, styles, inline SVG map, app state, and UI logic.
readme.md    Developer notes.
context/     LLM handoff context for future development sessions.
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


## Future Prompts

--
1.11

Have each UI hint be individually dismissible with a light grey ICON_GLOBAL_DISMISS__X_CIRCLE_FILL. Changing the UI toggle overrides individual dismisses and either turn them all off or back on

--
Setting close button looks a little off (needs more space)

--
2.0.0 - Improved Notes

- Delete button look weird on notes
- have seperate notes for who, what, where, when, how, why. Really just Where Specifically, What For, Who With (when is date)
- icons for places and visit types (types of visits: first; favorite; core memory)
- Better exports
types of visits: first; favorite; core memory

improve export format
