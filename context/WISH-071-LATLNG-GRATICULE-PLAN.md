# WISH-071 — Latitude / Longitude Map Lines (target 4.7.2)

Ticket: **WISH-071** "Latitude / Longitude Map Lines". Target: **4.7.2** (patch after 4.7.1). An optional lat/lng graticule overlay on **both** maps, styled to stay secondary to locations, Wayfinder, and Rangefinder overlays.

## Goal

Add a toggleable lat/lng graticule:
- **World map** — true graticule via the existing **Robinson** projection (`worldCoordinatePoint`): straight parallels, curved (sampled) meridians, 30° spacing, degree labels, with the **Equator / Prime Meridian / Tropics / Polar circles** emphasized.
- **US map** — **true lat/lon per state**, drawn through each state's own local frame, with **separate grids inside the insets** (Alaska, Hawaii, territories). Lines are continuous *within* a state's box but do **not** connect across states (the US map is a stylized tile layout, not a single projection) — that's expected and by design.
- A **per-map overlay toggle** (remembered separately for US and World), kept visually subordinate to markers/rings/labels.

## Why the two maps differ (key projection facts)

- **World**: `worldCoordinatePoint(coords)` is a real **Robinson** projection — `ROBINSON_X/Y_COEFFICIENTS`, `WORLD_MAP_CENTRAL_MERIDIAN`, `worldProjectionBox()`. Parallels depend only on lat (straight horizontals); meridians curve with lat (sample to a polyline). Fully invertible-enough to draw a graticule.
- **US**: there is **no global US projection**. `projectNoteLocation` maps a note's lat/lng *within one state* using `locationProjectionFrame(abbr,…)` → per-state `LOCATION_GEO_BOUNDS[abbr]` = `[minLat,maxLat,minLng,maxLng]` linearly mapped into that state's tile bbox, with `LOCATION_PROJECTION_FRAME_OVERRIDES[abbr]` supplying separate box+bounds for multi-region states/insets (AK, HI, …). Because each state's frame is a **linear** lat/lng→box map, a constant-lat line is a straight horizontal segment in that box and a constant-lng line is a straight vertical segment — so a per-state graticule is cheap to draw, just discontinuous across tiles.
- Overlay precedent: ring overlays are SVG `<g>` layers injected per map (`#mapRingOverlay`, `#worldMapRingOverlay`, created ≈5500). The graticule should be a sibling `<g>` placed **below** markers/rings/labels in paint order.

## Behavior / UX

### World graticule (Robinson)
- For each parallel at the chosen interval (lat = …−30,0,30…, plus key lines), the line is horizontal: compute `y = worldCoordinatePoint({lat, lng:0}).y` and span x across `worldProjectionBox()` width (or sample a few lng points; Robinson y is lng-independent so a straight segment is exact).
- For each meridian (lng = …−30,0,30… of **true** longitude, projected through `WORLD_MAP_CENTRAL_MERIDIAN`), sample lat from −90→90 in steps (e.g. 5°), project each via `worldCoordinatePoint`, build a polyline (meridians curve).
- **30° spacing** (Q2). **Emphasize** Equator (0°), Prime Meridian (0°), Tropics (±23.44°), Arctic/Antarctic circles (±66.56°) with a slightly stronger/distinct stroke; label lines in degrees at the map frame edges (parallels at left/right, meridians at top/bottom). Clamp/handle the date-line wrap via the existing `longitudeOffset` logic.

### US graticule (per state + insets)
- For every `.state-tile` (and each inset region via `LOCATION_PROJECTION_FRAME_OVERRIDES`), read its `bounds = [minLat,maxLat,minLng,maxLng]` and `box`. Draw the integer-multiple-of-interval lat lines within `[minLat,maxLat]` as horizontal segments (`y = box.y + box.height·(maxLat−L)/(maxLat−minLat)`, full box width) and lng lines within `[minLng,maxLng]` as vertical segments. Reuse the exact ratio math from `projectNoteLocation` (incl. `projectionLongitudeForBounds`) so lines match where pins land.
- Insets (AK, HI, territories) naturally get their **own** grids/intervals because they have their own box+bounds. **US interval should be finer than 30°** (states span only a few degrees) — propose ~5° (tune); flag as a tuning decision.
- Optional light per-state degree labels (small, at a box edge); may start label-less on US to avoid clutter and add if wanted.

### Toggle, styling, persistence
- **New map-header overlay toggle** (a button alongside pins/labels controls), **per map** (Q3). Reuse the map-control button pattern; advertise a shortcut if there's a free key.
- **Setting**: add a per-layer flag, mirroring `ringByLayer` — e.g. `settings.graticuleByLayer = { us:false, world:false }` (default **off**). Add defaults in `defaultState()` and repair in `normalizeState()`; **preserve `usStateVisitMap.v1`**.
- **Styling**: thin, low-contrast, theme-aware lines (CSS vars); key world lines emphasized; everything **below** markers/rings/labels and non-interactive (`pointer-events:none`) so map taps/pan/zoom are unaffected. Lines live in the zoom/pan-transformed SVG so they scale with the map.

## Implementation phases (for `start`)

1. Open `4.7.2.1`, CHANGELOG entry (patch → no banner/cta), bump `APP_VERSION`.
2. Settings: `graticuleByLayer {us,world}` defaults + normalize.
3. Inject a graticule `<g>` layer per map (below markers/rings), like the ring overlay setup (≈5500); add `renderGraticule()` called from the map render path.
4. World graticule: parallels + sampled meridians via `worldCoordinatePoint`/`worldProjectionBox`, 30° + emphasized key lines + edge labels.
5. US graticule: per-state/per-inset straight segments from `LOCATION_GEO_BOUNDS` + `LOCATION_PROJECTION_FRAME_OVERRIDES`, finer interval.
6. New per-map toggle button + handler + button-state sync; CSS for line/label styling (+ emphasis + theme).
7. Surfaces: Help/FAQ, hints, keyboard reference, README, handoff. Mark WISH-071 done at `ship`.
8. Verify (parse + desktop/mobile smoke on 8018, both maps, fit + zoomed, both themes).

## Open questions / risks

- **US interval tuning** (~5° vs 10°) and whether US lines need degree labels — start minimal, tune.
- **US discontinuity is by design** — confirm the user is fine with grid lines not connecting across the stylized state tiles (they asked for "true lat/lon for US including different grids inside the insets", which this delivers).
- **Robinson sampling density** for meridians (step size) — balance smoothness vs node count; meridians are ~7 lines × ~37 samples = cheap.
- **Label placement / clutter**, especially where graticule labels meet country/state labels (WISH-057) — keep graticule subordinate; consider hiding world labels-vs-graticule overlaps or just lower graticule contrast.
- **Performance / re-render**: render once per map render (not per zoom/pan, since it's in the transformed SVG). ~7+7 world lines + ~50 US boxes × few lines — trivial.
- **Central meridian / date-line wrap** on the world meridians — reuse `longitudeOffset`.

## Verify (at `start`/`prep`)

- World map: toggle on → 30° graticule with curved meridians, straight parallels, emphasized Equator/Prime Meridian/Tropics/Polar circles, degree labels; lines sit behind pins/rings; pan/zoom still works; off → fully removed.
- US map: toggle on → each state shows its own true lat/lon lines, insets (AK/HI) show their own grids; lines align with where a known-coordinate pin lands; off → removed.
- Per-map memory: toggling on World doesn't enable US and vice-versa; survives reload.
- Both themes; `./build/check.sh`, `git diff --check`, desktop + mobile (375px) on port 8018.
