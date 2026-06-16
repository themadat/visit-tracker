# WISH-071 — Latitude / Longitude Map Lines (target patch)

Ticket: **WISH-071** "Latitude / Longitude Map Lines". Target: **patch**. An optional lat/lng graticule overlay on **both** maps, styled to stay secondary to locations, Wayfinder, and Rangefinder overlays.

## Goal

Add a toggleable lat/lng graticule with **two line tiers (major + minor)** and **user-customizable intervals**, configured from a **settings pop-up**:
- **World map** — true graticule via the existing **Robinson** projection (`worldCoordinatePoint`): straight parallels, curved (sampled) meridians, plus the **projection outline/frame** (curved ±180° edge meridians closed by the pole parallels) so the map's curvature reads instead of looking like a rectangle. Defaults: **30° major, 10° minor**. Reference lines (Equator / Prime Meridian / Tropics / Polar circles) may be optionally emphasized on top.
- **US map** — **true lat/lon per state**, drawn through each state's own local frame, with **separate grids inside the insets** (Alaska, Hawaii, territories). Defaults: **10° major, 5° minor**. Lines are continuous *within* a state's box but do **not** connect across states (the US map is a stylized tile layout, not a single projection) — that's expected and by design.
- **Major lines** read stronger and carry **degree labels at both line ends**; **minor lines** are thinner/subtler (lighter or no labels).
- A **per-map control** (button → settings pop-up) holding on/off + major/minor intervals, remembered separately for US and World, kept visually subordinate to markers/rings/labels.

## Why the two maps differ (key projection facts)

- **World**: `worldCoordinatePoint(coords)` is a real **Robinson** projection — `ROBINSON_X/Y_COEFFICIENTS`, `WORLD_MAP_CENTRAL_MERIDIAN`, `worldProjectionBox()`. Parallels depend only on lat (straight horizontals); meridians curve with lat (sample to a polyline). Fully invertible-enough to draw a graticule.
- **US**: there is **no global US projection**. `projectNoteLocation` maps a note's lat/lng *within one state* using `locationProjectionFrame(abbr,…)` → per-state `LOCATION_GEO_BOUNDS[abbr]` = `[minLat,maxLat,minLng,maxLng]` linearly mapped into that state's tile bbox, with `LOCATION_PROJECTION_FRAME_OVERRIDES[abbr]` supplying separate box+bounds for multi-region states/insets (AK, HI, …). Because each state's frame is a **linear** lat/lng→box map, a constant-lat line is a straight horizontal segment in that box and a constant-lng line is a straight vertical segment — so a per-state graticule is cheap to draw, just discontinuous across tiles.
- Overlay precedent: ring overlays are SVG `<g>` layers injected per map (`#mapRingOverlay`, `#worldMapRingOverlay`, created ≈5500). The graticule should be a sibling `<g>` placed **below** markers/rings/labels in paint order.

## Behavior / UX

### Major + minor tiers (both maps)
- Each map draws **two tiers**: lines at the **minor** interval (thin/subtle) and, on top, lines at the **major** interval (stronger, labeled). Implement by generating the line set at the minor interval and tagging any whose degree value is a multiple of the major interval as "major" (so majors are a superset visually and never doubled). Keep majors a clean multiple of minors (defaults are: 30/10 world, 10/5 US — both integer multiples).
- **End labels (both maps):** every **major** line carries a degree label at **both ends** (e.g. parallels labeled at their left & right ends, meridians at top & bottom), formatted like `30°N` / `120°W` / `0°`. Minor lines are unlabeled by default. Place labels just outside/at the line's endpoints, theme-aware, and keep them subordinate (don't fight country/state labels from WISH-057).

### World graticule (Robinson)
- Parallels are horizontal: `y = worldCoordinatePoint({lat, lng:0}).y`, span x across `worldProjectionBox()` (Robinson y is lng-independent, so a straight segment is exact). End labels at the left/right frame edges.
- Meridians: sample lat −90→90 in steps (e.g. 5°), project each true-longitude line through `worldCoordinatePoint` (handle `WORLD_MAP_CENTRAL_MERIDIAN` / date-line wrap via the existing `longitudeOffset` logic) → polyline (meridians curve). End labels at the top/bottom ends.
- Defaults **30° major / 10° minor**. Optionally also draw the named reference lines — Equator, Prime Meridian, Tropics (±23.44°), Arctic/Antarctic circles (±66.56°) — as an extra emphasized style (could be a checkbox in the pop-up); keep optional so it doesn't conflict with the major/minor model.
- **Projection outline / frame:** draw the Robinson boundary so the curvature reads instead of looking like a rectangle. The frame is the two extreme edge meridians (±180° from `WORLD_MAP_CENTRAL_MERIDIAN`, the curved east/west edges — sample like any meridian) closed by the pole parallels (90°N top, 90°S bottom — short horizontals, since Robinson narrows toward the poles), forming the flattened-oval silhouette. Render it as one closed polyline (or two meridian polylines + two pole segments) styled like a frame stroke (≈ major weight, maybe slightly stronger). It falls out of the same `worldCoordinatePoint` sampling. **Decision to confirm at `start`:** show the frame whenever the world graticule is on (plan default), or make it **always-on** for the world map regardless of the graticule (since the rectangle-look concern exists even with the graticule off). Plan leans: draw with the graticule now; flag always-on as an easy follow-up.

### US graticule (per state + insets)
- For every `.state-tile` (and each inset region via `LOCATION_PROJECTION_FRAME_OVERRIDES`), read its `bounds = [minLat,maxLat,minLng,maxLng]` and `box`. Draw the minor- and major-interval lat lines within `[minLat,maxLat]` as horizontal segments (`y = box.y + box.height·(maxLat−L)/(maxLat−minLat)`, full box width) and lng lines within `[minLng,maxLng]` as vertical segments. Reuse the exact ratio math from `projectNoteLocation` (incl. `projectionLongitudeForBounds`) so lines match where pins land.
- Insets (AK, HI, territories) naturally get their **own** grids because they have their own box+bounds. Defaults **10° major / 5° minor**.
- Major lines get end labels clipped to each state's box edges; given how small state boxes are, consider showing US end labels only on majors (or only on larger states) to avoid clutter — tune at `start`.

### Settings pop-up, toggle, styling, persistence
- **A per-map control button** in the map header (alongside pins/labels) opens a **settings pop-up** (reuse an existing header pop-up pattern — e.g. the ring-style menu or map-label picker — for consistency and outside-click close, and so it clamps on mobile). Pop-up contents **per map**: on/off, **major interval**, **minor interval** (numeric inputs or steppers, validated to sane ranges and major ≥ minor and ideally a multiple), optionally the reference-lines emphasis checkbox. The button's pressed/badged state reflects whether the graticule is on.
- **Setting (schema):** per-layer object, mirroring `ringByLayer` — `settings.graticuleByLayer = { us: { enabled:false, major:10, minor:5 }, world: { enabled:false, major:30, minor:10 } }`. Add defaults in `defaultState()` and clamp/repair in `normalizeState()` (validate intervals, enforce major ≥ minor, fall back to defaults on bad data); **preserve `usStateVisitMap.v1`**.
- **Styling**: thin, low-contrast, theme-aware lines (CSS vars) with a stronger major stroke; everything **below** markers/rings/labels and non-interactive (`pointer-events:none`) so map taps/pan/zoom are unaffected. Lines live in the zoom/pan-transformed SVG so they scale with the map; labels too (so they don't need per-zoom repositioning).

## Implementation phases (for `start`)

1. Open the next patch build, CHANGELOG entry (patch → no banner/cta), bump `APP_VERSION`.
2. Settings: `graticuleByLayer = { us:{enabled,major:10,minor:5}, world:{enabled,major:30,minor:10} }` defaults + clamp/normalize (validate intervals, major ≥ minor).
3. Inject a graticule `<g>` layer per map (below markers/rings), like the ring overlay setup (≈5500); add `renderGraticule()` called from the map render path.
4. Major/minor line generator (shared): produce minor-interval lines, tag majors (multiples of `major`); major = stronger stroke + end labels, minor = subtle, unlabeled.
5. World graticule: parallels + sampled meridians via `worldCoordinatePoint`/`worldProjectionBox`; the projection outline/frame (edge meridians + pole parallels); end labels at frame edges; optional reference-line emphasis.
6. US graticule: per-state/per-inset straight segments from `LOCATION_GEO_BOUNDS` + `LOCATION_PROJECTION_FRAME_OVERRIDES`; major end labels (tuned for clutter).
7. New per-map control **button → settings pop-up** (on/off + major/minor intervals, validated); button-state sync; CSS for line/label styling (major/minor + theme); ensure the pop-up clamps on mobile.
8. Surfaces: Help/FAQ, hints, keyboard reference, README, handoff. Mark WISH-071 done at `ship`.
9. Verify (parse + desktop/mobile smoke on 8018, both maps, fit + zoomed, both themes).

## Open questions / risks

- **US major end-label clutter**: state boxes are small; majors at 10° may still crowd — may show US labels only on majors / larger states, or only at box edges. Tune at `start`.
- **Interval validation**: enforce sane ranges and major ≥ minor (ideally a clean multiple) in the pop-up and `normalizeState`; decide UI (free numeric vs stepper vs preset list).
- **US discontinuity is by design** — grid lines don't connect across the stylized state tiles (the user explicitly asked for true per-state lat/lon + separate inset grids, which this delivers).
- **Label placement / clutter** where graticule meets country/state labels (WISH-057) — keep graticule subordinate (lower contrast, below labels).
- **Robinson sampling density** for meridians — balance smoothness vs node count (cheap either way).
- **Performance / re-render**: render once per map render (not per zoom/pan, since it's in the transformed SVG). Minor tier multiplies line count but stays small.
- **Central meridian / date-line wrap** on the world meridians — reuse `longitudeOffset`.

## Verify (at `start`/`prep`)

- World map: graticule on → 30° major (labeled at both ends) + 10° minor (subtle), curved meridians, straight parallels, **and the projection outline/frame so the map reads as a curved Robinson shape, not a rectangle**; lines behind pins/rings; pan/zoom works; off → fully removed.
- US map: graticule on → each state shows its own true lat/lon major (10°) + minor (5°) lines with insets (AK/HI) getting their own grids; lines align with where a known-coordinate pin lands; off → removed.
- Settings pop-up: changing major/minor per map updates that map live and persists; bad values are clamped; the two maps stay independent across reload.
- End labels read correctly (`30°N`, `120°W`, `0°`) at both ends of major lines.
- Both themes; `./build/check.sh`, `git diff --check`, desktop + mobile (375px) on port 8018.
