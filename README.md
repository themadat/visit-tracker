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

const __HAND_THUMBSUP_CIRCLE = `<svg class="sf-symbol" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 25.8008 25.459"><g><rect height="25.459" opacity="0" width="25.8008" x="0" y="0"/><path d="M12.7148 25.4395C19.7363 25.4395 25.4395 19.7461 25.4395 12.7246C25.4395 5.70312 19.7363 0 12.7148 0C5.69336 0 0 5.70312 0 12.7246C0 19.7461 5.69336 25.4395 12.7148 25.4395ZM12.7148 23.623C6.68945 23.623 1.81641 18.75 1.81641 12.7246C1.81641 6.69922 6.68945 1.82617 12.7148 1.82617C18.7402 1.82617 23.6133 6.69922 23.6133 12.7246C23.6133 18.75 18.7402 23.623 12.7148 23.623Z"/><path d="M5.50781 14.7754C5.50781 16.8164 6.73828 18.5254 8.4375 18.5254L9.75586 18.5254C8.47656 17.6367 7.91992 16.2793 7.94922 14.707C7.96875 12.9492 8.64258 11.7676 9.20898 11.0156L8.19336 11.0156C6.66016 11.0156 5.50781 12.6758 5.50781 14.7754ZM8.7793 14.7168C8.75 17.2363 10.7617 19.1309 13.9551 19.1504L14.8926 19.1602C15.7812 19.1699 16.4258 19.1016 16.8066 19.0137C17.3438 18.877 17.8809 18.5547 17.8809 17.9004C17.8809 17.6562 17.8027 17.4316 17.7246 17.2949C17.6758 17.2168 17.6758 17.1387 17.7637 17.0996C18.1738 16.9336 18.5352 16.5332 18.5352 15.9961C18.5352 15.6836 18.4473 15.4004 18.291 15.2148C18.2031 15.1172 18.2227 15.0195 18.3398 14.9414C18.6621 14.7559 18.877 14.3848 18.877 13.9258C18.877 13.623 18.7793 13.2617 18.5938 13.1055C18.4766 13.0078 18.5059 12.9492 18.623 12.8516C18.8281 12.666 18.9648 12.3438 18.9648 11.9727C18.9648 11.2891 18.4473 10.752 17.7734 10.752L15.3613 10.752C14.7363 10.752 14.3359 10.4395 14.3359 9.92188C14.3359 9.00391 15.4785 7.31445 15.4785 6.11328C15.4785 5.48828 15.0586 5.10742 14.5312 5.10742C14.0332 5.10742 13.7988 5.43945 13.5449 5.95703C12.5098 7.93945 11.1523 9.55078 10.1172 10.9473C9.23828 12.0996 8.79883 13.1055 8.7793 14.7168Z"/></g></svg>`;

const __HAND_THUMBSDOWN_CIRCLE = `<svg class="sf-symbol" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 25.8008 25.459"><g><rect height="25.459" opacity="0" width="25.8008" x="0" y="0"/><path d="M12.7148 25.4395C19.7363 25.4395 25.4395 19.7461 25.4395 12.7246C25.4395 5.70312 19.7363 0 12.7148 0C5.69336 0 0 5.70312 0 12.7246C0 19.7461 5.69336 25.4395 12.7148 25.4395ZM12.7148 23.623C6.68945 23.623 1.81641 18.75 1.81641 12.7246C1.81641 6.69922 6.68945 1.82617 12.7148 1.82617C18.7402 1.82617 23.6133 6.69922 23.6133 12.7246C23.6133 18.75 18.7402 23.623 12.7148 23.623Z"/><path d="M19.7754 10.5566C19.7754 8.51562 18.5352 6.81641 16.8359 6.81641L15.5176 6.81641C16.8066 7.70508 17.3535 9.05273 17.334 10.6348C17.3047 12.3828 16.6406 13.5645 16.0742 14.3164L17.0801 14.3164C18.623 14.3164 19.7754 12.666 19.7754 10.5566ZM16.5039 10.6152C16.5332 8.10547 14.5215 6.21094 11.3184 6.18164L10.3906 6.17188C9.50195 6.16211 8.84766 6.23047 8.47656 6.32812C7.93945 6.46484 7.40234 6.77734 7.40234 7.43164C7.40234 7.68555 7.48047 7.90039 7.55859 8.03711C7.60742 8.125 7.59766 8.19336 7.51953 8.23242C7.09961 8.39844 6.73828 8.80859 6.73828 9.33594C6.73828 9.6582 6.82617 9.93164 6.99219 10.1172C7.07031 10.2148 7.06055 10.3223 6.93359 10.3906C6.61133 10.5762 6.40625 10.9473 6.40625 11.4062C6.40625 11.7188 6.50391 12.0703 6.68945 12.2363C6.79688 12.3242 6.77734 12.3926 6.65039 12.4902C6.45508 12.6758 6.31836 12.998 6.31836 13.3691C6.31836 14.043 6.82617 14.5898 7.5 14.5898L9.92188 14.5898C10.5469 14.5898 10.9473 14.9023 10.9473 15.4102C10.9473 16.3281 9.80469 18.0176 9.80469 19.2188C9.80469 19.8535 10.2246 20.2246 10.7422 20.2246C11.25 20.2246 11.4844 19.9023 11.7383 19.375C12.7637 17.3926 14.1309 15.7812 15.166 14.3848C16.0449 13.2324 16.4844 12.2363 16.5039 10.6152Z"/></g></svg>`;

const __FIGURE_DISC_SPORTS_CIRCLE = `<svg class="sf-symbol" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" viewBox="0 0 25.8008 25.459"><g><rect height="25.459" opacity="0" width="25.8008" x="0" y="0"/><path d="M12.7148 25.4395C19.7363 25.4395 25.4395 19.7461 25.4395 12.7246C25.4395 5.70312 19.7363 0 12.7148 0C5.69336 0 0 5.70312 0 12.7246C0 19.7461 5.69336 25.4395 12.7148 25.4395ZM12.7148 23.623C6.68945 23.623 1.81641 18.75 1.81641 12.7246C1.81641 6.69922 6.68945 1.82617 12.7148 1.82617C18.7402 1.82617 23.6133 6.69922 23.6133 12.7246C23.6133 18.75 18.7402 23.623 12.7148 23.623Z"/><path d="M13.2812 8.00781C14.1211 8.00781 14.7949 7.32422 14.7949 6.49414C14.7949 5.66406 14.1211 4.9707 13.2812 4.9707C12.4414 4.9707 11.7578 5.66406 11.7578 6.49414C11.7578 7.32422 12.4414 8.00781 13.2812 8.00781ZM11.0547 17.0898C11.3281 17.3633 11.7676 17.373 12.0508 17.0898L14.9219 14.2188C15.3125 13.8281 15.0488 13.1152 14.4531 13.0469L11.25 12.6953C10.9766 12.6562 10.9375 12.5 11.0547 12.334L12.1973 10.6055C12.3047 10.4395 12.5293 10.4004 12.6855 10.5078L14.7168 11.8457C14.8242 11.9238 14.9512 11.9824 15.0977 11.9824L17.9688 11.9824C18.3496 11.9824 18.6719 11.6602 18.6719 11.2793C18.6719 10.8789 18.3496 10.5566 17.9688 10.5566L15.3125 10.5566L9.10156 6.42578C8.99414 6.34766 8.86719 6.30859 8.7207 6.30859L5.83984 6.30859C5.45898 6.30859 5.13672 6.63086 5.13672 7.01172C5.13672 7.40234 5.45898 7.72461 5.83984 7.72461L8.51562 7.72461L9.64844 8.47656C9.81445 8.58398 9.86328 8.79883 9.74609 8.97461L8.0957 11.4453C7.33398 12.5879 7.99805 14.1211 9.47266 14.209L12.7637 14.375L11.0547 16.0938C10.7715 16.3672 10.7715 16.8164 11.0547 17.0898ZM8.39844 14.502L8.39844 16.9824L6.5332 19.1602C6.2793 19.4531 6.31836 19.9219 6.61133 20.1758C6.97266 20.4492 7.40234 20.3516 7.62695 20.0977L9.64844 17.7148C9.76562 17.5684 9.80469 17.4121 9.82422 17.2754L10.2246 14.8242L9.44336 14.7852C9.0625 14.7656 8.70117 14.6777 8.39844 14.502ZM17.9688 9.31641C17.9688 9.79492 18.7695 10.1953 19.7461 10.1953C20.7031 10.1953 21.5137 9.79492 21.5137 9.31641C21.5137 8.82812 20.7031 8.42773 19.7461 8.42773C18.7695 8.42773 17.9688 8.82812 17.9688 9.31641Z"/></g></svg>`;
