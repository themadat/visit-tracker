# WISH-061 — Rangefinder Edge Cases, Globe Wrap & Time Zones (target 4.7.6)

Ticket: **WISH-061** (Maps, **large**, `tokenCostPct 48`). Target: **4.7.6** — all three sub-features together. Three related Rangefinder upgrades: (1) cross-inset edge cases, (2) antimeridian wrap on the World map, (3) offline time zones.

## Implementation status

Implemented in `4.7.6.1`: inset radius limits and approximate great-circle cues; mirrored World rings, visible wrapped labels, and shorter seam-crossing comparison cues; offline country/state IANA resolution with longitude-aware multi-zone choices; persisted manual overrides and departure settings; DST-aware destination-local arrival; responsive light/dark UI; Help, README, changelog, Roadmap, and handoff updates.

## Current Rangefinder internals (what we build on)

- **Rings are ellipses**: `renderRingOverlay` (≈6904) draws each enabled distance as an ellipse `rx = miles·scale.xPerMile`, `ry = miles·scale.yPerMile` centered at the Start anchor's SVG point, inside a `<g class="ring-shapes">` that is either **clip-path**'d to land (`ensureRingLandClipPath`) or **masked** to an inset (`ensureRingInsetMask`). `milesToSvgScale(lat, abbr)` (≈4377) already handles the **World Robinson** scale (lat-dependent) and **US per-state/inset** scale.
- **Anchors**: per-layer bags `state.settings.ringByLayer.{us,world}` with `anchor1/anchor2`; helpers `ringAnchorFor`, `anchorSvgPoint`, `repairRingAnchors`.
- **Cross-region already detected/warned**: `ringAnchorsCrossMapRegions(a,b)` (≈3935) + `ringInsetWarning` (≈3939) already explain Washington↔Alaska / inset / world cases ("Distance uses real coordinates; the dashed map cue is not a route and rings stay in the Start region"). Region keys via `ringMapRegionKey/Name`; `RING_INSET_IDS`.
- **Distance/time**: real-coordinate great-circle distance already drives labels; `ringSpeedMph`, `ringTimeLabel(miles)`, `ringShowTime`. World box/projection: `worldProjectionBox()`, `worldCoordinatePoint`, `WORLD_MAP_CENTRAL_MERIDIAN`.
- **No time-zone handling** exists (only one `Intl.DateTimeFormat` use, for note dates). Crucially, **`Intl.DateTimeFormat(undefined,{timeZone})` computes local time + DST offset offline** from the browser's built-in IANA database — so the only hard part is **lat/lng → IANA zone name** offline.

## 1) Cross-inset edge cases (visual polish over existing infra)

The detection + honest distance already exist; the upgrade is **clearer visuals** when Start/End span the contiguous map and an inset (AK/HI/territories) or the world:
- Keep distance on **real coordinates** (already honest). Keep rings **in the Start region** (already true).
- Improve the **cross-region cue**: render the dashed Start→End indicator clearly as a *non-route* hint (distinct dashed style + a small "≈ great-circle" tag), and make the inset-scale limitation visible (e.g. when the Start sits in an inset, cap ring radii to the inset's drawable area and show a subtle "rings limited to inset" affordance rather than letting an ellipse blow past the inset mask).
- Tighten `ringInsetWarning` copy if needed; no projection/topology changes — this is presentation on top of `ringAnchorsCrossMapRegions` / `milesToSvgScale` / the inset mask.

## 2) Antimeridian wrap — mirror/duplicate ellipses (chosen)

On the **World map**, when the Start anchor is near the date line so its ring ellipses clip at the map's left/right edge, **also draw a second copy of the `ring-shapes` group translated by ±`worldProjectionBox().width`** so the part that runs off one edge appears on the opposite edge (continuous-looking across the seam). Approximation (rings stay ellipses), which reads fine at world scale.
- Draw the mirror copy only when the Start's rings reach within a margin of a seam (Start lng near `WORLD_MAP_CENTRAL_MERIDIAN ± 180`); usually one copy (the nearer seam), occasionally both.
- Keep **clip-to-land** and **inset** behavior (the wrapped copy reuses the same clip/mask, offset). **Arc-following labels** appear on the visible arc of whichever copy is on-screen.
- **Shorter great-circle Start→End**: when drawing the dashed Start→End cue across the seam, pick the wrap direction with the shorter longitudinal delta (`((Δlng+540)%360)−180`) so Honolulu→Tokyo draws the short way, not across the whole map.
- **US map unchanged** (no antimeridian there).

## 3) Offline time zones — region→IANA table + manual fix (chosen)

- **Data**: a compact `REGION_IANA_ZONE` map — US state/territory abbr → primary IANA zone, and world country ISO-2 → primary IANA zone (inert const in `assets/js/`, e.g. a small `world-names`-style companion). Multi-zone regions use a sensible primary; optionally refine by the anchor's **longitude** (pick among a region's zones by lng band) before falling back to manual.
- **Compute** (all offline via `Intl`): for each anchor's resolved zone, show **local time + zone** (e.g. `3:42 PM PDT · America/Los_Angeles`) using `Intl.DateTimeFormat(undefined,{timeZone, timeStyle, ...})` and `formatToParts` for the zone abbrev/offset. DST is automatic.
- **Departure → arrival**: let the user pick a **departure time** (default = now, in the Start zone). Compute **arrival = departure + travel-time estimate** (reuse `ringTimeLabel`/minutes from the current speed/mode) and format it in the **End** (destination) zone — so it reads as destination-local arrival, DST-correct across the trip. Show both zones' clocks for Start and End.
- **Manual correction**: when a zone can't be resolved (no entry / ambiguous / inset), let the user pick or override the zone for that anchor; persist the override. Surface a clear "couldn't resolve — set zone" affordance (never silently wrong).
- **US + World**: works on both layers (anchors carry `abbr`/region).
- **UI**: a time-zone section in the Rangefinder panel (below the distance/time readout), collapsible to keep the panel calm; respects the existing units/format settings.

## Schema / data

- **New inert data**: `REGION_IANA_ZONE` table.
- **New persisted settings** (preserve `usStateVisitMap.v1`): time-zone state — likely on/near the ring bags or a small `ringTimeZones` object: a **departure time** (or "now"), per-anchor **manual zone overrides**, and a show/collapse flag. Add defaults in `defaultState()` and repair/validate in `normalizeState()` (drop unknown IANA names, clamp times). The mirror-wrap and cross-inset visuals need **no** schema change.

## Implementation phases (for `start`)

1. Open `4.7.6.1`, CHANGELOG entry. (Large — land sub-features across several builds; ship together.)
2. **Cross-inset visuals**: refine the dashed cross-region cue + inset radius caps; tighten warning copy.
3. **Antimeridian**: detect seam-proximity; duplicate `ring-shapes` translated by ±map width (reusing clip/mask); wrapped-arc labels; shorter-wrap Start→End cue.
4. **Time-zone data**: `REGION_IANA_ZONE` (+ optional lng refinement).
5. **Time-zone compute/UI**: Start/End local time + zone, departure picker, destination-local arrival, manual override; settings + normalize.
6. CSS + Help/FAQ/hints, README, handoff. Mark WISH-061 done at `ship`.
7. Verify (parse + desktop/mobile on 8018; US insets, date-line world Starts, DST cases).

## Open questions / risks

- **Multi-zone regions**: big states/countries (US, RU, AU, ID/OR/TN…) span zones; the table picks a primary and the lng refinement + manual override cover the rest — confirm that's acceptable vs. a precise polygon dataset (rejected as too large).
- **Patch release**: the user selected 4.7.6 for all three sub-features; keep it banner-free as a patch.
- **Mirror-ellipse fidelity**: ellipse rings duplicated across the seam are an approximation, not true great-circle bands; fine at world scale, note it in copy.
- **Departure-time persistence & "now"**: decide whether departure persists or resets to now each session; recompute arrival when speed/mode/time changes.
- **DST/zone correctness**: rely on `Intl` (offline, authoritative) for offsets; only the zone *name* resolution is ours.
- **Panel density / mobile**: the new time-zone block must stay subordinate and fit small screens (reuse existing Rangefinder panel patterns).

## Verify (at `start`/`prep`)

- US: a Washington Start with an Alaska End shows honest distance, rings confined/legible in the Start region, and a clear non-route cross-region cue; inset Starts cap cleanly.
- World: a Start near the date line (Honolulu/Tokyo/Sydney) shows rings continuing across the seam (wrapped copy), clip-to-land preserved, labels on the visible arc; Start→End takes the shorter wrap.
- Time zones: Start/End show correct local time + IANA zone offline; a chosen departure yields a DST-correct destination-local arrival; an unresolved zone offers manual correction; works US + World; nothing hits the network.
- `./build/check.sh`, `git diff --check`, desktop + mobile (375px), both themes, on port 8018.
