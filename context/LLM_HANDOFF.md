# LLM Handoff

Copy this into new chats:

```text
Continue work in /Users/stripes/Documents/GitHub/visit-tracker. Read context/LLM_HANDOFF.md first. Respect manual edits. Run git status --short before editing. Use port 8018 for local preview.
```

Shorthand commands: **`wish`**, **`plan`**, **`start`**, **`prep`**, **`ship`**,
**`pause`** — see Workflows below.

## Workflows: `wish` / `plan` / `start` / `prep` / `ship` / `pause`

Six shorthand commands drive planning and the version lifecycle: `wish`
captures a Roadmap idea, `plan` explores and documents the feature, `start`
implements from the plan and opens the version line, `prep` makes it
release-ready, `ship` condenses it into a cut release, and `pause` checkpoints
a line mid-flight so a different LLM/session can resume it cold. This split is
intentional: one LLM/session can produce the plan and handoff context, then a
fresh LLM/session can run `start` to implement from that written plan. Always
run `git status --short` first and preserve in-flight manual edits. End every
working session with two copy-paste containers: first the commit description in
list form, then the commit command with title in the exact format
`` `_vt-checkpoint "APP_VERSION - <commit title>"` `` — always wrap the title in
double quotes so it pastes cleanly into a terminal (it contains spaces and
shell-special characters).

### `wish` — capture a Roadmap idea

Record an idea for later without implementing it.

- Check `WISHLIST_SEEDS` for duplicates and nearby wishes before assigning the
  next unused `WISH-###` id.
- Capture a complete seed: title, behavior-focused description, priority,
  effort, target kind/version, estimated token cost, compact implementation
  prompt, and category.
- Use sensible defaults when the request is clear. Ask concise clarifying
  questions only when an ambiguity materially changes scope, priority, or
  architecture, and state any assumptions used.
- Relate the new wish in an active plan doc when it is a direct follow-up to
  that work.
- Do not create a plan doc, retarget an exact version, or implement the wish
  unless the user explicitly asks.
- Since the Roadmap is visible in the app, bump the active build and add a
  public-safe `CHANGELOG` update when a wish is added.
- Verify the app parses and the new Roadmap item renders/searches correctly.

### `plan` — explore and document a feature

Talk through the feature before implementation.

- Read the Snapshot for the latest cut release and any active dev line.
- Dig into the feature: inspect relevant code, ask concise questions, identify
  risks, data-model impacts, migration needs, UI states, exports, and tests.
- Write or revise `context/WISH-<id>-<slug>-PLAN.md` with scope, constraints,
  implementation phases, schema changes, UX behavior, open questions, and a
  concrete test plan.
- Update this handoff with any new context future implementers need, including
  the active plan reference, important invariants, and where to start reading.
- If the feature matches a `WISHLIST_SEEDS` ticket, reference it by `WISH-###`;
  only retarget `targetVersion` when the user explicitly chooses a release.
- Planning-only edits need no `APP_VERSION` or `CHANGELOG` churn unless the
  user explicitly asks for user-visible Roadmap changes.
- Do not implement the feature during `plan` unless the user explicitly changes
  the request.

### `start` — implement a planned feature

Open or continue the implementation line from an existing plan.

- Read the Snapshot, the active plan doc, and this handoff before editing.
- If there is no clear plan doc for the requested feature, stop and run `plan`
  first unless the user explicitly asks for a small direct implementation.
- Open the line by bumping `APP_VERSION` to a fresh build (e.g. `4.2.0` →
  `4.2.1.1`, or a new minor `4.3.0.1`) and starting a new `CHANGELOG` entry
  with a working (cheeky, on-theme) title. Bump the fourth build number for
  each subsequent change on the line.
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
  - **What's New / release notice banner**: `banner` ≤100 chars,
    themed `cta` ending in `!`.
  - **Release notes** (`CHANGELOG`): highlights (≤4 bullets, ≤100 chars each)
    plus the dense `updates` list; keep wording public-safe (no tickets,
    prompts, or workflow mechanics).
  - **`README.md`** feature/surface list.
  - **Roadmap** `WISHLIST_SEEDS`: mark shipped items done / retarget versions.
  - **This handoff**: refresh Snapshot, Current Surface, invariants, and UX as
    needed, and condense it so it stays lean.
- Lock the release theme name and the final `cta`.
- Verify the app parses and the new flows work. Leave the line in active-dev
  form (`APP_VERSION` still `x.y.z.N`) when prep is done.

### `ship` — condense the version (finalize the cut)

Collapse the dev build line into one released entry.

- Set `APP_VERSION` to the released semantic version, dropping the `.N` build
  segment (e.g. `4.2.0.27` → `4.2.0`).
- Collapse the active `CHANGELOG` entry's per-build notes into a single clean
  release: `Major.Minor.Patch :: YYYY-mm-dd :: Theme`, bold one-line summary,
  ≤4 highlights, dense `updateSections`. The banner derives version/title from
  the entry, so dropping the `.N` build segment is the only version sync needed.
- Sync public surfaces one last time: `README.md` release/history table,
  Help/FAQ/hints, release notice copy, and any Roadmap shipped/retargeted state.
- Update the Snapshot's **Current version** and **Latest public releases**
  lines. Delete/retire in-flight plan docs from `context/` and remove active
  plan references from this handoff unless the user explicitly asks to keep a
  historical reference file.
- Run final verification: parse, `git diff --check`, preview on port 8018,
  smoke the shipped flows, stop the local server, then re-run
  `git status --short`.
- Leave no active dev line; the next substantial change begins with `plan`, or
  `start` when a plan already exists.

### `pause` — checkpoint a line mid-flight (tool/session handoff)

End a working session before the line is done — typically when a usage window
runs out — so any LLM (Claude Code or Codex) can resume cold.

- Verify the app still parses; if it does not, say so explicitly in the
  Resume block and the commit title.
- Write or refresh a `## Resume` block at the top of the active plan doc (or
  in the Snapshot when no plan doc exists): done so far, in progress right
  now, exact next steps, files/symbols touched, verification status, open
  gotchas.
- Commit everything with the normal two copy-paste blocks; WIP commits are
  fine — mark them `WIP` in the title.
- Stop the local server.
- The resuming session ramps from git, not from re-reading code:
  `git log --oneline -5`, `git diff main...HEAD --stat`, then the Resume
  block.

## Release Notes

For every completed change:

- Bump the fourth `APP_VERSION` build number (in `index.html`). The `CHANGELOG` constant lives in `assets/js/changelog.js`.
- When finalizing a release, set `APP_VERSION` to the released semantic version and collapse same-line patch/build notes into that release entry.
- Entry shape: `{ version, date, title, summary, highlights, updateSections: [{ heading, items }] }`, plus `banner` + `cta` **only on feature releases** (major/minor, i.e. a `.0` patch segment). The What's New banner derives its pill version, title, and dismissal keys from `version`/`title` — there is no separate notice object, so nothing extra to sync on `ship`.
- The banner highlights feature releases only: `latestFeatureNotice()` surfaces the newest entry with `patch === 0`, so patch releases (x.y.Z, Z>0) ship without popping the banner and need no `banner`/`cta`.
- The Full Update List toggle shows an "X sections · Y updates" tally (sections = grouped `updateSections` entries, updates = total sub-bullets; a flat string list shows just the update count).
- Update `CHANGELOG` using the collapsed release-note format: `Major.Minor.Patch :: YYYY-mm-dd :: Cheeky theme name`, then a bold one-line summary, then `highlights` and `updateSections`.
- Keep `highlights` short: **max 4 bullets, each ≤100 characters.** Anything longer or extra goes in `updateSections` (the fuller, denser change list grouped under headings).
- Release Notes UI shows each release as a scannable card: header + summary + visible Highlights, with the Full Update List behind a clear collapsed toggle.
- `banner` (the What's New banner blurb) must never exceed 100 characters. Only feature releases (major/minor) carry one; the banner shows the newest feature entry, so patch releases omit `banner`/`cta`.
- `cta` changes per version like the theme name and should be themed toward that release's title along with an exclamation point! (e.g. a Basecamp release → "Set Up Camp!"). A `|` in the text forces the banner's line break.
- Keep changelog wording public-safe: describe features and changes, not internal tickets, prompts, or workflow mechanics.
- When manual or unexpected edits are present, identify their app/docs effect and include it in `CHANGELOG` alongside the current update.
- Keep the current major/minor release entry updated unless intentionally opening a new release line.
- Preserve the localStorage schema where possible.
- Give me two copy-paste containers: the first contains the commit description in list form;
  the second contains the commit command with title in this format: `_vt-checkpoint "APP_VERSION - <commit title>"` (always double-quote the title so it pastes cleanly into a terminal)

## Snapshot

- Trail Log is a local-first HTML/CSS/JS app with no build step: `index.html`
  (markup, CSS, app logic) plus plain data companion scripts in `assets/js/` —
  `icons.js` (`__*` SVG icon consts + generated `CIRCLE_ICON_SVGS` registry),
  `maps.js` (`__US_AND_WORLD_MAP_MARKUP`, injected into `.map-wrap` as the main
  script's first statement), `changelog.js` (`CHANGELOG`), `roadmap.js`
  (`WISHLIST_SEEDS`) — loaded as classic scripts before the main script, so
  top-level consts share the global lexical scope and work over `file://`.
- Main file: `index.html`. `STORAGE_KEY = "usStateVisitMap.v1"`, version in `APP_VERSION`.
- Docs: `README.md` (public/run/build), this handoff (all dev + LLM context), `AGENTS.md` + `CLAUDE.md` (thin auto-loaded agent summaries — keep lean).
- Current version: `APP_VERSION = "4.7.2.1"` — active dev line **4.7.2 "Trail Marks"** implementing WISH-077 (Roadmap "Plan ready" badge), WISH-078 (headed release-notes Full Update List), and WISH-068 (raptor easter egg — tap Niihau, the westernmost Hawaii island, on the US map). Latest cut release: **4.7.1 "Atlas Ink"** (smarter World map labels).
- Gotcha worth keeping: `url()` paths in `assets/css/app.css` are **relative to the stylesheet**, not the page root (e.g. app-icon art is `url("../icons/…")`). The 4.5.1 fix corrected `.install-icon-thumb-{light,dark}` which still used the old root path after the 4.4.1 CSS split.

Verification traps still apply: UI drivers that call `save()` mutate real localStorage (snapshot first); Wayfinder/Waypoint panels need a configured bucket-list level to render; `http.server` has no cache headers (force-reload assets).
- Latest public releases (newest first): 4.7.1 "Atlas Ink", 4.7.0 "Priority", 4.6.1 "A Small World", 4.6.0 "The Whole Story", 4.5.2 "Get Your Bearings", 4.5.1 "Back in the Picture", 4.5.0 "Leave No Trace", 4.4.4 "Fine Print", 4.4.3 "Clear View", 4.4.2 "True Colors", 4.4.1 "Ultralight", 4.4.0 "Basecamps". Full per-release behavior lives in the `CHANGELOG` constant in `assets/js/changelog.js`; release table in `README.md`. Don't duplicate per-release prose here — read the CHANGELOG entry for the version in question.
- Recent shipped scope (one-liners only; see CHANGELOG for detail):
  - 4.7.1 **Atlas Ink** — World Name labels use offline English short names, fit-aware sizing, multiline wrapping, dot-backed leader-line callouts, baked dense-region overrides, and a dismissible Developer Tools-backed Tune mode that can move, rename, resize, line-break, and export reusable World label overrides. No persisted app-state schema changes.
  - 4.7.0 **Priority** — priority becomes a first-class note field with editor/header controls, square badges on note icons and map pins, Detailed/Condensed direct updates, exact/higher/lower filtering, 1-to-5 or 5-to-1 ordering, priority grouping that can duplicate locations by matching notes, and priority in Markdown/Rich Text/Plain Text exports. Adds persisted `notesPriorityFilter`, `notesPrioritySort`, and `notesPriorityGroup`; legacy `notesSortMode: "priority"` migrates to chronological tie-breaking with 5-to-1 priority ordering.
  - 4.6.1 **A Small World** — scopes map-layer refreshes, shows destination/spinner/progress inside the switch button before SVG paint, keeps inactive maps out of the paint tree, and restores the Shift+Control+Option+~ chord across Backquote/dead-key variants. No schema changes.
  - 4.6.0 **The Whole Story** — adds Detailed as the default Notes view, brings all four views into individual locations, exposes complete editable note details and Waypoint actions, adds coordinate-status icons and collapsible location note groups, and tightens Expanded/Condensed layouts. Right Arrow cycles sort; Down Arrow cycles view. No schema changes.
  - 4.5.2 **Get Your Bearings** — Rangefinder's ring-style menu stays open for live fill/clip changes. Legend totals identify their US, World, or active Waypoint Pack grouping; Map Labels uses matching theme-aware icons with tuned World sizing. No schema changes.
  - 4.5.1 **Back in the Picture** — patch: the "Add as App" icon previews showed only a colored background. `.install-icon-thumb-{light,dark}` `background-image` used a page-root `url("assets/icons/…")` that broke when the 4.4.1 CSS split moved the rules into `assets/css/app.css` (relative `url()` resolves against the stylesheet → `assets/css/assets/icons/…`). Fix: `url("../icons/…")`. No schema changes.
  - 4.5.0 **Leave No Trace** — broad small-screen pass (CSS-heavy + some `index.html` JS; no schema changes): Basecamp becomes a mobile two-view (`basecampMobileView` list↔detail on `#basecampWorkspace`); World-map switch hides the inactive map (`:not([hidden])`); Tip Jar closes (`[open]`); note editor scrolls with title on its own line + reordered location fields; linked-note photo frame sized to the photo's own ratio via `sizeNoteWaypointPhotoFrame()` (definite px height — only that sizes the `.dialog-body` grid row) and opening it scrolls `#noteForm` to top on mobile; Rangefinder/Basecamp pop-up menus stay on-screen; Notes ≥75dvh; dropped the "P#" note-row badge. Banner target (newest feature entry, `patch === 0`).
  - 4.4.4 **Fine Print** — release-notes refinements: the What's New banner surfaces only feature releases (major/minor, `patch === 0`) via `latestFeatureNotice()`, so patch ships skip it and patch entries omit `banner`/`cta`. The Full Update List toggle tallies "X sections · Y updates" from `updateSections` (`renderReleaseSection`). No schema changes.
  - 4.4.3 **Clear View** — Waypoint Packs panel opens as a full-cover floating card over the Notes column (uniform `.55rem` inset replacing a fixed top offset that the taller compact/Wayfinder header overflowed), scrolls into view on open, and while open hides the notes lists + drops sticky positioning on category headings (via `#notesPanel[data-waypoint-open]`) so no heading bleeds over the panel. CSS/JS only; no schema changes.
  - 4.4.2 **True Colors** — pack-icon theme consistency: the NPS arrowhead SVG (`__NATIONAL_PARK_SERVICE_LOGO_SIMPLE` in `assets/js/icons.js`) now uses `currentColor` fills/strokes like every other icon, replacing per-surface `path[fill="#000"]` overrides in `app.css`. Condensed note rows keep the intentional hollow-arrowhead style, keyed to row ink. No behavior or schema changes.
  - 4.4.1 **Ultralight** — no-build split: styles in `assets/css/app.css`; icon/map/changelog/roadmap data in `assets/js/` classic scripts loaded before the main script; `CIRCLE_ICON_SVGS` registry replaces source-scan icon discovery; dead code removed and unused icon art parked in `build/icon-sources/`; CHANGELOG entries flattened to top-level `banner`/`cta`. No behavior or schema changes.
  - 4.4.0 **Basecamps** — Basecamp becomes up to twenty named rich-text pads with icons, search, reorder, formatting toolbars, linked US/World notes, and per-pad exports. Legacy `{ text, updated }` migrates once into "Basecamp Pad". `usStateVisitMap.v1` schema unchanged.
- Open follow-ups: WISH-071 (optional lat/lng map lines, P0); WISH-075 (pack-photo camera location, P0); WISH-074 (pinch-to-zoom the map on touch, P0); WISH-076 (native-language World labels, P1); WISH-073 (Basecamp photo support, P2).
- Plan docs live in `context/` only while their line is in flight, then are deleted on ship. **Active 4.7.2 plans (in flight):** `context/WISH-077-ROADMAP-PLAN-BADGE-PLAN.md`, `context/WISH-078-RELEASE-NOTES-LIST-PLAN.md`, `context/WISH-068-RAPTOR-EASTER-EGG-PLAN.md` — all implemented at 4.7.2.1 (raptor: `RAPTOR_HIT_REGION`/`raptorTapHit`/`showRaptorEasterEgg` in `index.html`, `__RAPTOR` in `icons.js`, `.raptor-egg`/`.tag.plan-ready` in `app.css`). Queued plans (not yet started): `context/WISH-071-LATLNG-GRATICULE-PLAN.md` (lat/lng graticule, 4.7.2) and `context/WISH-075-PHOTO-CAMERA-LOCATION-PLAN.md` (pack-photo camera location, 4.7.2); `context/WISH-074-PINCH-ZOOM-PLAN.md` (touch pinch/double-tap/two-finger-tap zoom, 4.7.3); `context/WISH-061-RANGEFINDER-EDGECASES-PLAN.md` (Rangefinder cross-inset + antimeridian wrap + offline time zones, 4.7.5 — large, all three); `context/WISH-063-THEMING-OVERHAUL-PLAN.md` (app-wide theming overhaul — every color selectable, palette button moves to the top bar left of Settings, large grouped modal; 5.0.0 major flagship).
- No build step (other than the optional macOS icon pipeline — see README), backend, or dependencies.
- User data lives in browser localStorage. Locate and Waypoint Pack Wikipedia
  photo previews are intentional online actions and only run when clicked.

## Rules

**Process**

- Run `git status --short` before editing.
- Manual edits are authoritative. Preserve dirty work unless the user explicitly asks to revert it.
- Edit surgically, especially in `index.html`; do not reformat the file.
- App behavior changes usually require `APP_VERSION`/`CHANGELOG` updates. Docs-only, handoff-only, or planning-only edits do not need release churn unless the user asks.
- When a change affects dev rules, repo context, or future handoff instructions, update this file. Keep `README.md` for public/run/build info only — do not duplicate dev rules there.
- `AGENTS.md` (Codex) and `CLAUDE.md` (Claude Code; imports AGENTS.md) auto-load a thin summary every session. Keep them lean; this handoff stays the source of truth.

**Token discipline** (`index.html` ≈ 0.86 MB ≈ 214k tokens; the `assets/` companions hold another ~720k — none of the big files fit in context)

- Never read `index.html`, `assets/js/icons.js`, or `assets/js/maps.js` whole or in large spans. `rg -n` first, then read tight ranges (≲200 lines).
- `index.html` landmarks (re-derive with `rg -n "</head>|<script" index.html`): HTML body ≈ lines 36–1.6k; main script ≈ 1.6k–16.2k (~190k tokens). All styles live in `assets/css/app.css` (~64k tokens).
- Companions: `icons.js` ≈426k tokens and `maps.js` ≈241k are inert art data — jump by symbol, never scroll. `changelog.js` ≈25k and `roadmap.js` ≈6k are safe to open in slices.
- Don't echo big chunks of the files or command output into chat; prefer `rg -c`, `git diff --stat`, `head`.
- End every final reply with two copyable blocks: first the commit description
  in list form, then `_vt-checkpoint "APP_VERSION - <commit title>"` (always
  double-quote the title for terminal safety).

**Code**

- Keep the app no-build and dependency-free: `index.html` plus plain classic companion scripts in `assets/js/`. No bundlers, ES modules, backend, or runtime dependencies; everything must keep working over `file://`.
- Prefer small, readable functions over new abstractions.
- Use semantic HTML and accessible labels for new controls; theme-aware colors via CSS variables.
- Keep all features offline and local-only. Destructive UI actions go through `requestConfirm(...)`.

**Persistence & migration** (saved-data compatibility is first-class)

- New persisted fields: add defaults in `defaultState()` and repair/defaulting in `normalizeState()`.
- Preserve the `usStateVisitMap.v1` schema. Never overwrite existing user-created arrays or settings unless the user explicitly resets.

**Roadmap (`WISHLIST_SEEDS`, in `assets/js/roadmap.js`)** — developer-facing defaults only; never persisted in user backups.

- Item shape: `title`, `ticketId` (`WISH-###`), `description`, `priority`, `effort`, `targetKind`, `targetVersion`, `tokenCostPct`, `prompt`, `category`.
- `priority`: `P0`–`P3`. `effort`: `small` | `medium` | `large` | `x-large`.
- `targetKind`: `exact` (with a `targetVersion`) or a bucket — `major` | `minor` | `patch`.
- `description` states behavior and scope; `prompt` is a compact, minimal-token implementation prompt for an LLM.
- When adding items, use sensible defaults and state them; ask concise
  clarifying questions only when ambiguity materially changes the wish.

**Release notes** — keep public-facing: describe shipped behavior, not prompts, tickets, or internal workflow.

## Quick Commands

```sh
rg -n "APP_VERSION|STORAGE_KEY" index.html
rg -n "version:" assets/js/changelog.js | head    # release entries
rg -n "ticketId" assets/js/roadmap.js             # wish seeds
rg -n "function defaultState|function normalizeState|function save" index.html
rg -n "function renderNotesPanel|function renderMap|function bindEvents" index.html
git diff --check
python3 -m http.server 8018   # preview at http://127.0.0.1:8018/index.html; stop before final reply
```

## Code Map

- `index.html` constants: `APP_VERSION`, `STORAGE_KEY`, `STATES`/`STATE_NAMES`, `BUILT_INS`, `THEMES`, `MAP_LAYERS`.
- `assets/js/` companions: `icons.js` (`__*` SVG consts + `CIRCLE_ICON_SVGS` registry), `maps.js` (`__US_AND_WORLD_MAP_MARKUP`), `changelog.js` (`CHANGELOG`), `roadmap.js` (`WISHLIST_SEEDS`).
- Persistence: `defaultState`, `loadState`, `normalizeState`, `save`.
- Map: `initMap`, `handleStateTap`, `cycleState`, `renderMap`, `renderLocationMarkers`, `renderRingOverlay`, `bindMapPanZoom`, `setMapZoom`, `toggleMapFitMode`.
- Legend: `renderLegend`, `moveLevel`, `deleteLevel`, `smartApplyPalette`, `setLegendPosition`.
- Notes: `renderNotesPanel`, `openNoteDialog`, `lookupNoteCoordinates`, `saveNoteFromForm`, plus sort/filter helpers.
- Settings/exports: `renderSettingsControls`, `exportMarkdown`, `exportRichText`, `importJson`.

## Verify

- **Parse check**: `./build/check.sh` — one command; runs every `assets/js`
  companion plus the wrapped main `<script>` through macOS `jsc`
  (`node` is not guaranteed on this machine). Pure helpers can be unit-tested
  in isolation with `jsc`.
- **Preview server**: the `.claude/launch.json` preview wrapper can accept
  connections but reset them. The reliable recipe: run
  `python3 -m http.server 8018` as a background task, then point the
  preview panel or browser at `http://127.0.0.1:8018/index.html`. Don't
  re-debug the wrapper.
- **Search hygiene**: `.rgignore` keeps `assets/svgs/` and the world-map
  sources out of repo-wide `rg` results; explicitly targeting those paths
  (e.g. `rg --files assets/svgs`) still works for deliberate browsing.
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
  basecamp: {
    pads: [{ id, name, icon, html, plainText, linkedNotes: [{ noteId, regionCode }], created, updated }],
    activePadId,
    legacyMigrated
  },
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
- Basecamp HTML is sanitized before persistence; `plainText` is derived from
  the sanitized body. Legacy `basecamp.text` migration must never rerun once
  pads exist, and linked-note ids resolve across both note stores.
- Selected-location Notes detail ignores main-list filters.
- Match Notes map filtering follows active Notes filters.
- Selecting an excluded-from-stats legend level auto-enables Show Excluded;
  turning Show Excluded off drops excluded-level pills from the active filter.
- Map zoom mutations (button / keyboard / wheel / reset / fit toggle) must
  flow through `syncMapZoomReadout()` so the `#mapZoomReadout` value and the
  zoom button enable states stay in sync.

## Current Surface

- Map: SVG state/territory map + world map; layer toggle (`#mapLayerToggleBtn`); scroll/fit modes, pan/zoom persistence, labels, clustered note pins, Match Notes filtering. Wayfinder pill rides inside the layer toggle when active.
- Waypoint Packs: Wayfinder-only Packs button `#notesAddWaypointsBtn` (`__CIRCLE_BADGE_PLUS`) opens an inset panel over Notes with bundled National Parks/Monuments packs, available-pack cards, overlay/label controls in the Pack Locations header, 40px square Website/Photo/Edit-Link/Unlink buttons, compact Priority controls, pack-aware markers, preview priority badges, batch-add into Wayfinder, and safe remove behavior. Notes header Wayfinder button is `#notesActivateWayfinderBtn`. See the 4.3.0 CHANGELOG entry for full behavior.
- Legend: editable levels (name, color, definition, exclude-from-stats, Wayfinder), drag reorder, swipe quick actions, movable desktop placement.
- Rangefinder: Shortcut Mode key `5` / target button opens a paired panel with the Legend, picks saved note pins as Start/End, draws straight-line Drive/Plane planning rings on US and World maps, and keeps per-map ring distances, units, fill/clip/time style, travel mode, and average speed settings.
- Notes: search (with `/` hint chip + universal `/` shortcut), alpha/chrono base sort, Detailed/Expanded/Condensed/Text views, category grouping, icon filters, Show Excluded toggle (styled like legend's excluded pattern), coordinate/date precision filters, and a unified Priority popover for exact/higher/lower filtering, 1-to-5 or 5-to-1 primary ordering, and priority grouping.
- Note editor: Quick Add, City/Where/What/Who/Details, local field suggestions, Smart Convert, partial/flexible dates, weekday preview, manual/lookup coordinates, multiple icon tags, an always-available priority field, and Add to active pack. Quick Add defaults to the Wayfinder level when Wayfinder Mode is on.
- Location Icon Tags: configurable active tags plus auto-discovered More Icons from `__*_CIRCLE` constants, generated labels/search tags, explicit aliases, aliased-first sorting.
- Basecamp: up to 20 named rich-text pads with icons, cross-pad search (`/` focuses), drag + `Alt+Up`/`Alt+Down` reorder, header-click rename/icon picker, Format/Font/Text/Other toolbars with Cmd/Ctrl chips and editor-local undo/redo, linked US/World notes (Basecamp stays open behind the editor), per-pad and all-pad copy, per-pad Markdown/RTF/Plain Text exports. Legacy `{ text, updated }` migrates once into a "Basecamp Pad" pad with the default icon. Helpers funnel through `normalizeBasecampState` + `basecampExportPads()`.
- Wayfinder: per-row "Mark Visited" promote action on Wayfinder notes (`openNoteDialog(id, { promoteBucketVisited: true })`) opens the editor pre-filled with `levelId: "visited"` + today's date when blank.
- Help / What's New / Roadmap / Developer Tools (with grouped Keyboard Shortcuts Reference at `#keyboardShortcutsReference`) live under Settings tabs.
- Exports: JSON, Markdown, RTF, Plain Text — MD/RTF/Text gain Countries, Wayfinder, Waypoint Packs, and per-pad Basecamp sections when engaged; Wayfinder exports group linked pack notes under their pack name. Helpers: `bucketListExportEntries()`, `suggestedSetExportEntries()`, `basecampExportPads()`.

## UX Preferences

- Compact, practical, map-first.
- Mix of Travel, Outdoorsy, Geeky Vibe.
- Avoid airy marketing UI.
- Desktop main view should stay viewport-locked above 980px; Notes scroll internally.
- Mobile/tablet keeps single-column page scroll below 981px.
- Settings dialog should have one scroll surface: `.dialog-body`.
- Help Center stays searchable and focused.
- Public release notes describe user-facing features.
