# WISH-057 — Smarter World Map Labels (target 4.7.1)

Ticket: **WISH-057** "Smarter World Map Labels". Target: **4.7.1** (patch after 4.7.0 "Priority"). World map only — **US-map label behavior stays unchanged**. Inspiration: a detailed world map with country names, and a blank world map with island names (offset labels with leader lines).

## Implementation status

`4.7.1.1` is open. The first pass adds offline English short names, rewrites the World-map label renderer around shrink-to-fit candidates and greedy collision filtering, and adds leader-line callouts for `.circlexx` microstate dots plus countries too small for in-land labels. Parse/diff checks pass, and the in-app browser smoke on port 8018 renders the World/Name label layer with country labels plus leader-line callouts and no console errors.

## Goal (scoped from the four sub-features)

In scope for 4.7.1:
1. **Declutter + shrink-to-fit country labels** — at the whole-world (fit) zoom every country label currently renders at a fixed size and dense regions overlap into mush. Instead, **size each country's label to fit its landmass** (down to a readable minimum), and run a **collision pass** that hides/parks any labels that still overlap.
2. **Microstate / island labels with leader lines** — surface the tiny countries (the SVG's hidden `.circlexx` dots) with a small offset name and a thin **leader line** from the label to the dot.
3. **English short-name display mode** — labels need a name mode that shows clean **English short names** (e.g. "South Korea", not "Korea, Republic of"), curated from the user's source (Wikipedia "List of countries and dependencies and their capitals in native languages").

Explicitly **out of scope**: zoom-aware label density (we rely on shrink-to-fit instead), and any engaged-only mode / engaged collision priority.

## Current state

- `renderWorldMapLabels()` (`index.html` ≈7860): clears `#worldMapLabels`, and for every `#worldMap .world-tile` places one `<text>` at `stateTileCenter(code)` with a **fixed** font (`name`→26, `abbr`→32). No fit-to-tile, no collision handling → the overlap problem.
- Label modes: `state.settings.mapLabels` ∈ `none|abbr|name` (default `none`); validated in `normalizeState` (≈3029), cycled by the segmented control (`#…map-label-toggle`, "Choose Labels: Locations | None | Abbr | Name"). `abbr` = ISO-2 code; `name` = `regionName(code)`.
- Country geometry: `.landxx` paths become `.world-tile`s (≈5477; requires a `.landxx` class). **315 `.landxx` paths**; tile center via `stateTileCenter`/`tileCenterCache` (memoized `getBBox`, ≈6153).
- Microstates: **76 `.circlexx` dots** in `maps.js`, e.g. `<circle id="ps_" class="circlexx ps" r="4" cx cy>` — ISO-2 in the class, fixed position. They are **not** `.world-tile`s today, so they are currently neither labeled nor clickable. They are the ideal anchors for the island/microstate labels.
- `regionName(code)` / `ensureWorldRegions`: resolve names by lazy scan of `#worldMap` (titles/ids). Quality/length of those names is the open data question (see below).
- Labels are SVG `<text>` inside the map SVG, so they scale with the CSS map zoom; sizing/collision is computed once per render (no per-zoom recompute needed, since density is not zoom-aware).

## Behavior / UX

### 1. Shrink-to-fit + collision (country labels)
- For each `.world-tile`, compute a font size that fits the label within the tile's bbox **width** (and roughly its height), clamped to `[minPx, maxPx]` (tune; e.g. ~9–34 in world-SVG units). Big countries read large; small ones shrink.
- If even at `minPx` the label can't fit the tile (tile too small) → demote that country to a **leader-line label** (treat like a microstate; see §2).
- **Collision pass:** place labels in priority order = **largest tile bbox first** (bigger countries win; no engaged special-casing per the decision), greedily skipping any whose (sized) bbox overlaps an already-placed label's box (with small padding). Skipped labels are hidden (not stacked). This is the "declutter."
- Keep it to **one render pass** (toggling the mode / data change), not on zoom/pan — sizing is for the base geometry and scales with the map.

### 2. Microstate / island labels (leader lines)
- Build anchors from `#worldMap .circlexx` (76) — read ISO-2 from the class (the non-`circlexx` token), use `cx/cy` as the dot position. Also include any `.landxx` countries demoted in §1.
- Render a small `<text>` **offset** into nearby open space + a thin `<line>`/`<path>` **leader** from the label to the dot. Choose an offset direction (prefer toward ocean / away from the map center; simple heuristic first) and feed these labels into the **same collision pass** so crowded clusters thin out instead of stacking.
- Style the leader line subtly (muted stroke, ~0.5–1px in screen terms) and keep labels theme-aware. Microstate dots may need to become visible/:hover-able; **do not** add clickability/marking here (that's the Countries-layer scope, WISH-001/056) unless trivial.

### 3. English short-name display mode
- Add a curated **ISO-2 → English short name** map (the bulk of the data work), sourced from the user's Wikipedia list, covering all `.landxx` + `.circlexx` codes (~248). Keep it a plain data const in `assets/js/` (e.g. extend `maps.js` companion or a small new `world-names` const) so it stays token-light and offline.
- Wire it into the `name` label mode: `name` shows the curated English short name (falling back to `regionName` when missing). `abbr` stays the ISO-2 code. **Decision to confirm at `start`:** improve the existing **Name** mode in place (no new control, no schema change) vs. add a 4th label option. Plan default: **improve Name in place** (simplest; the segmented control + `mapLabels` enum are unchanged).

### Out of scope (reconfirm)
- No zoom-aware density. No engaged-only mode. No change to US-map labels, Waypoint-pack labels, or marking/clickability.

## Data / schema

- **No persisted schema change** if we keep `mapLabels ∈ none|abbr|name` and just improve `name`. (If a 4th mode is added later, extend the enum + `normalizeState` repair; preserve `usStateVisitMap.v1`.)
- New inert data: the curated English-short-name map. Source is Wikipedia (CC BY-SA) — names are facts (non-copyrightable), fine to use; cite source in a comment.

## Implementation phases (for `start`)

1. Open `4.7.1.1`, CHANGELOG entry (patch → no banner/cta), bump `APP_VERSION`.
2. Add the curated ISO-2 → English short-name data; resolve names for all `.landxx` + `.circlexx` codes.
3. Rewrite `renderWorldMapLabels`: per-tile shrink-to-fit sizing + greedy collision pass (largest-first), hiding overflow.
4. Add microstate/leader-line labels from `.circlexx` (+ demoted small countries) into the same collision pass.
5. Wire the English short-name into `name` mode; verify Abbr/None unaffected; US map untouched.
6. CSS: leader-line + microstate-label styles (theme-aware), label sizing bounds.
7. Surfaces: Help/FAQ, hints, README feature list, handoff. Mark WISH-057 done at `ship`.
8. Verify (parse + desktop/mobile smoke on 8018, world map at fit + zoomed).

## Open questions / risks

- **Name-data completeness & sizing**: every `.landxx`/`.circlexx` code needs a short name; long names (e.g. "Democratic Republic of the Congo") will shrink hard or demote to leader lines — confirm acceptable.
- **Collision performance**: ~248 + 76 labels each need a `getBBox`/measured width (forced layout). Do it once per label render (not per zoom). Watch for jank; consider measuring text width via a cached canvas/`getComputedTextLength` instead of bbox where possible.
- **Leader-line placement**: first cut is a simple offset heuristic; dense clusters (Caribbean, Europe microstates, Pacific) may still need hand-tuned offsets or a small overrides map (mirrors US `MAP_LABEL_OVERRIDES`).
- **Name mode: improve-in-place vs new control** (plan default: improve in place).
- **Patch vs minor**: this is a medium-effort feature in a patch slot — fine if scoped to the three items above; flag if it grows.

## Verify (at `start`/`prep`)

- World map, Name mode, fit zoom: country names are readable (no overlapping mush); big countries large, small ones shrunk; overflow hidden, not stacked.
- Microstates show offset labels with leader lines to their dots; clusters thin instead of stacking.
- English short names are correct (spot-check e.g. KR, CD, CZ, AE, GB, US).
- Abbr mode (ISO) and None unchanged; **US map labels identical to before**.
- Zoom in/out and pan: labels scale with the map, no errors; `./build/check.sh`, `git diff --check`, desktop + mobile (375px) on port 8018.
