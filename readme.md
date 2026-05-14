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
- Update `CHANGELOG` using the collapsed release-note format: `Major.Minor.Patch :: YYYY-mm-dd :: Cheeky theme name`, then a bold one-line summary, then bullets.
- Keep changelog wording public-safe: describe features and changes, not internal tickets, prompts, or workflow mechanics.
- Keep the current major/minor release entry updated unless intentionally opening a new release line.
- Preserve the localStorage schema where possible.
- Mention any known manual QA gaps in the handoff.


## Future Prompts

Wishlist: tweak the A-Z icon alignment, it just looks off
Wishlist: SF Symbol Converting Tool

by the way the change log doesn't always need to just be 3 bullets. I would like it to have a "highlights" section which is a bit more abbreviated, and then a more dense full flushed out update list

____

Have each UI hint be individually dismissible with a light grey ICON_GLOBAL_DISMISS__X_CIRCLE_FILL. Changing the UI toggle overrides individual dismisses and either turn them all off or back on

For the main view I don't ever want any overall vertical scroll. Adjust map height based on width to account for this. If this means the map width shrinks, give that space to the legend/notes column. When there is enough content in the notes modal to require scrolling have the list perfectly scroll to match the map container bottom with no differences

I want the Label Tag to Stand out differently. blue accents make it look like it is selected. I want it to to look like it a category title with toggle options (like in settings)

When toggling map fit don't highlight its color. change symbol, but keep same color since this is always active.

Settings has gotten a little too airy. TIghten it down and use different H sizes for parent categories and sub-categories

Have the import/export section follow some of these rules. Button of equal size stretch to space. Less wasted vertical space towards the top

Lets combine and update Help and FAQ into a single page called Help Center. Add a search bar that would surface and highlight potential help points or faq answers. First have Documentation, then FAQs, then Send Feedback Section. Send feedback should be a cheeky reference to if you know you know

Combine Changelog and Wishlist into one page called "What's New". In there have two sub-sections Release Notes and Roadmap
