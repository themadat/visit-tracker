# WISH-010 — Drive Radius (Ring Mode)

Target: **4.2.0 "Rangefinder"**.
Branch: `4-2-0-radius`.
Source ticket: `WISH-010 "Add Drive Radius"` (P0, large, `category: "Maps"`).
Original seed targeted 3.2.0 — update the seed's `targetVersion` to `4.2.0` when the release cuts; until then leave it alone.

Mode name throughout the UI: **Rangefinder Mode**. Internal symbols /
selectors use the `ring*` prefix (`#mapRingModeBtn`, `ringMode`,
`#ringPanel`) for compactness; user-facing copy reads "Rangefinder."

> _"Show a planning radius from home or saved locations. Scope includes
> distance input, visual radius overlay where map geometry supports it, saved
> settings, and clear limitations for non-road distance."_

## Snapshot

- **Rangefinder Mode**: map mode toggled by a new button placed to the right
  of Wayfinder in the map header. Activates a paired panel that splits 50/50
  with the legend (right on desktop, above on mobile).
- **US map only.** Disabled on the World layer.
- **Primary anchor (anchor 1)** with 5 fixed concentric rings: **60 / 300 /
  600 / 900 / 1200 mi**. Each ring toggleable. **Rings always render around
  anchor 1.**
- **Soft filled rings by default** with a panel checkbox **"Fill rings"** to
  switch to stroke-only (fill opacity → 0). Strokes stay visible in both
  modes.
- **North-of-circle ring labels**, always shown when the ring is enabled,
  format `{miles}mi / {hours}hr` (60mi/1hr · 300mi/5hr · 600mi/10hr ·
  900mi/15hr · 1200mi/20hr at 60 mph). Labels live at the top (12 o'clock)
  of each ring.
- **Both anchors must be existing note pins** (notes with valid coords). No
  state-center taps, no ad-hoc lat/lng entry.
- **Panel layout**: `"{anchor1} to {anchor2}"` row. Each slot is a tap
  target. Tapping a slot arms it; the next note-pin click on the map
  fills/replaces that slot.
  - **Anchor 1 always exists once set** — slot can be re-armed to *replace*
    anchor 1 (next pin tap swaps it), but there is no "clear anchor 1"
    action. The only way to remove anchor 1 is to turn Rangefinder Mode off.
  - **Anchor 2 is optional** — has a small × clear that empties slot 2 and
    hides the compare readout.
- **Compare readout** (anchor 2 set): straight-line distance + estimated
  drive time at hard-coded **60 mph**.
- **Dismissable hint** (first activation, persists per `dismissedHints`):
  "Distances are straight-line ('as the crow flies') and times assume 60 mph.
  Not actual driving distance."
- Works in regular mode AND while Wayfinder Mode is on — fully independent.
- Rings disappear when Rangefinder Mode turns off (no residue). Anchors
  persist for next activation.

## Constraints (read first)

1. **No shared map projection.** Both `us` and `world` SVG layers pin notes by
   linearly mapping lat/lng inside each region's `LOCATION_GEO_BOUNDS` bbox
   (`projectNoteLocation`, `index.html:17428`). A circle drawn on top of the
   US map will not be geometrically true — it's an approximation honest about
   itself. Ring labels and copy always lean on "straight-line distance — not
   actual drive time."
2. **Contiguous-US-friendly only.** The US SVG includes AK/HI/territory
   insets at non-real scale. Ring rendering is acceptable for CONUS anchors;
   when the anchor sits in AK/HI/PR/VI/GU/MP/AS, rings render inside that
   inset only — call it out in the panel.
3. **No backend.** Anchor selection is pure tap-on-map. No new online surface.
4. **localStorage schema preservation.** New persisted fields land via
   `defaultState()` + `normalizeState()`; storage key stays `usStateVisitMap.v1`.

## Scope

### In

1. **Ring Mode toggle button**
   - New `#mapRingModeBtn` in `.map-action-group.map-toggle-group`, placed
     immediately after `#mapBucketListBtn` in `.map-head-actions`
     (`index.html:7251`).
   - Icon: `__TARGET`. Same button-style scaffolding as Wayfinder
     (symbols/text/both) wired via `setButtonLabel` like `mapBucketListBtn`
     does at `index.html:16904`.
   - `aria-pressed`, `data-shortcut` (TBD key), `aria-label="Toggle Ring Mode"`.
2. **World-map disable.** When `activeLayerId === "world"`, the button is
   disabled with a hint ("Ring Mode is US map only"). Switching to World
   while Ring Mode is on turns Ring Mode off.
3. **Coexists with Wayfinder.** Ring Mode and Wayfinder Mode are independent
   and additive. Both pills can ride inside `#mapLayerToggleBtn` side by side
   (new `#mapRingModePill` modeled on `#mapBucketListPill`).
4. **Ring Anchor Panel** — new sibling DOM next to `#legendPanel`.
   - When Ring Mode is off: panel is hidden, legend takes its full normal
     width.
   - When Ring Mode is on: panel and legend share the legend slot 50/50.
     - Desktop (≥981px): row layout, panel to the right of the legend.
     - Mobile (<981px): column layout, panel above the legend.
   - Panel is visually paired with the legend (shared frame / matching
     header chrome / single rounded container with an internal divider).
   - When the legend is dragged to another corner (`legendPosition`), the
     Ring Panel rides along — it's a child of the same slot/container, not
     a free-floating element.
5. **Panel contents** (compact, no settings tab):
   - Header row: `__TARGET` icon + "Rangefinder" title.
   - **Anchor row**: a single inline expression
     `"{anchor1} to {anchor2}"`. Each anchor is a clickable slot.
     - Empty anchor-1 slot (initial state before any anchor exists) renders
       as a dashed-underline placeholder ("Pick a pin").
     - Empty anchor-2 slot renders as `"____"`.
     - Filled slot renders the pin's location label
       (`noteLocationDisplay(note) → note.geocodeLabel → noteSummary(note)
       → regionName(abbr)`).
     - Click a filled or empty slot → that slot becomes **armed** (visual
       highlight, panel hint says "Tap a note pin on the map").
     - Next note-pin tap on the map fills the armed slot and clears arming.
     - Tapping the same slot again while armed cancels arming.
     - **Anchor 1 cannot be cleared** — only replaced. No × button on slot 1.
     - **Anchor 2 has a small × clear** that empties slot 2 and hides the
       compare readout.
   - **Ring chips row**: five toggleable chips `60 · 300 · 600 · 900 · 1200`
     (mi). Each chip toggles its ring on/off. Default: all five on.
   - **Fill toggle**: checkbox **"Fill rings"** (default on). When off,
     rings render stroke-only (fill opacity → 0). Strokes remain visible.
   - **Compare readout** (only visible when both anchors are set):
     `985 mi · ~16h 25m at 60mph`. No swap action.
   - **Dismissable disclaimer hint** (first activation): "Distances are
     straight-line ('as the crow flies') and times assume 60 mph. Not actual
     driving distance." — uses the existing `dismissedHints` /
     `dismissHint(key)` infrastructure
     ([index.html:21638](index.html:21638)) with key `ring-mode-disclaimer`.
     Once dismissed, the panel keeps a small persistent footer microcopy:
     "Straight-line · 60 mph estimate."
6. **Anchor pin overlay.** New element in `#mapLocationMarkers` (or a
   dedicated overlay group `#mapRingOverlay`) — renders `__TARGET` glyph at
   the anchor's SVG position. Slightly larger than note pins so it reads as
   an authoring element, not a data marker.
7. **Ring rendering.**
   - SVG-per-mile derived from the anchor's state bbox (`LOCATION_GEO_BOUNDS`)
     using lat-degrees-per-SVG-unit + lng-degrees-per-SVG-unit (corrected by
     `cos(anchorLat)` for longitude).
   - Render each enabled ring as a single `<ellipse>` (different SVG x/y
     scales per mile) anchored at the anchor's SVG point.
   - **Stacking order: largest → smallest.** The 1200 ring renders first,
     then 900, 600, 300, 60. Each fill overlays the previous one, producing
     concentric banding with the deepest amber at the center.
   - **Default style**: soft fill (low opacity from outer to inner) +
     solid stroke. Toggle "Fill rings" off → fill opacity becomes 0; stroke
     stays.
   - **Labels** always render at the top (12 o'clock) of each enabled ring:
     `60mi / 1hr`, `300mi / 5hr`, `600mi / 10hr`, `900mi / 15hr`,
     `1200mi / 20hr` (at 60 mph). Positioned at
     `(anchor.x, anchor.y - yRadiusMiles)` with a small upward offset for
     legibility. Stroke-pad background ("text outline" via
     `paint-order: stroke fill` with a near-background stroke) so labels
     stay readable on any underlying tile color.
8. **Second anchor (compare).**
   - Both anchors share the same picker mechanic (armed slot in the panel +
     next note-pin tap).
   - Render a smaller paired pin at anchor 2 in `--accent-ring-secondary`.
   - Draw a thin connecting line between anchor 1 and anchor 2.
   - Compute distance via haversine. Time via `miles / 60`.
9. **Tap behavior in Ring Mode.**
   - State tap behavior is **unchanged** in Ring Mode — log-level cycling
     keeps working. Ring Mode never hijacks state taps.
   - Note-pin tap default behavior also unchanged (opens marker dialog).
   - **Exception**: when a panel slot is armed, the next note-pin tap on
     the map is intercepted — it fills the armed slot and does NOT open
     the marker dialog. Tap on an empty area or press Escape disarms.
10. **Persistence.** Persisted across reloads:
    - `ringMode` on/off.
    - Anchor 1 ref (`{ noteId, abbr, lat, lng, label }`).
    - Anchor 2 ref (same shape, nullable).
    - Which of the 5 rings are enabled.
    - Fill toggle on/off.
11. **Shortcut Mode key.** Use **`5`** on the button (`data-shortcut="5"`).
    Reassign the dispatch entry at [index.html:22636](index.html:22636) from
    the layer-toggle alias to `#mapRingModeBtn` — the layer toggle keeps its
    advertised `~` key and loses an undocumented alias.

### Out

- Saved Places list / "home" concept.
- State-center anchors / ad-hoc lat/lng entry — **anchors are always existing
  note pins.**
- Per-place radius config.
- Custom ring distances (rings are the fixed five for v1).
- Hour-based ring presets (only the compare readout shows hours; rings
  themselves are pure mileage).
- mph configurability — **hard-coded 60 mph** for v1.
- Notes "within radius" filter and notes-panel chip.
- Exports section for radius mode.
- World map support.
- Driving / routing APIs.

## Data shape

```js
state.settings = {
  ...,
  ringMode: false,
  ringAnchor1: null,
  // { noteId, abbr, lat, lng, label }
  ringAnchor2: null,
  // same shape as ringAnchor1; second/compare anchor (clearable)
  ringEnabled: [60, 300, 600, 900, 1200],
  // subset of the fixed five — which rings are visible
  ringFill: true
  // soft fill on/off
};
```

- `defaultState()` ([index.html:15568](index.html:15568)) seeds the five new
  settings.
- `normalizeState()` ([index.html:15941](index.html:15941)) repairs:
  - Coerces anchor lat/lng through existing
    `normalizeLatitude`/`normalizeLongitude`; drops malformed.
  - For each anchor: if the referenced note (`abbr` + `noteId`) doesn't
    resolve to a real note with valid coords, clears it. (Anchor 1 going
    null is allowed — the panel just arms slot 1 on next activation.)
  - Filters `ringEnabled` to the allowed `[60, 300, 600, 900, 1200]` set.
  - Coerces `ringFill` to boolean (default `true`).
  - If `activeLayerId === "world"` and `ringMode: true`, force `ringMode:
    false` on load.
- Backup/restore: includes these settings (user-configured planning state,
  not roadmap seed data).
- Hint key `ring-mode-disclaimer` participates in the existing
  `dismissedHints` array and `dismissHint()` flow — no schema work needed.

## Helpers (new)

```js
const RING_PRESETS = [60, 300, 600, 900, 1200];   // miles, immutable for v1
const RING_DEFAULT_MPH = 60;
const RING_LABEL_TEXT = {
  60:   "60mi / 1hr",
  300:  "300mi / 5hr",
  600:  "600mi / 10hr",
  900:  "900mi / 15hr",
  1200: "1200mi / 20hr"
};
function haversineMiles(aLat, aLng, bLat, bLng) { ... }
function ringModeActive() { ... }
function setRingMode(on) { ... }
function syncRingUi() { ... }                     // mirrors syncBucketListUi
function ringAnchorFor(slot) { ... }              // slot: 1 | 2
function setRingAnchorFromNote(slot, abbr, noteId) { ... }
function clearRingAnchor2() { ... }               // anchor-2 only; no slot-1 clear
function ringPickArmedSlot() { ... }              // 1 | 2 | null  (runtime-only)
function armRingSlot(slot) { ... }                // toggles
function anchorSvgPoint(anchor) { ... }           // SVG x/y for an anchor
function milesToSvgScale(anchorLat, anchorAbbr) { ... }  // { xPerMile, yPerMile }
function renderRingOverlay() { ... }              // anchor pins + rings + labels + connector
function ringCompareReadout() { ... }             // "985 mi · ~16h 25m at 60mph"
function ringTimeLabel(miles) { ... }             // "~Xh Ym" via 60 mph (used for compare)
```

Pick wiring: pin-tap handler checks `ringPickArmedSlot()` first; if non-null,
intercept the tap, call `setRingAnchorFromNote(slot, abbr, noteId)`, clear
arming, and return — do NOT open the marker dialog. Otherwise default
behavior. **State taps are never intercepted** (rings only anchor to note
pins).

## CSS hooks

- `html[data-ring-mode="on"]` root flag.
- `.ring-pill` rides inside `#mapLayerToggleBtn` next to `.bucket-list-pill`.
- `#ringPanel` paired with `#legendPanel` inside `.legend-slot`.
  - `.legend-slot[data-ring-open="1"]` flips the slot's flex direction
    (row on desktop, column on mobile) and gives both children
    `flex: 1 1 50%`.
- `#mapRingOverlay` SVG group for rings + anchor pins + connector.
- `.ring-anchor-pin.is-anchor-1`, `.ring-anchor-pin.is-anchor-2`.
- `.ring-anchor-slot` (panel slot button), `.ring-anchor-slot.is-armed`
  (highlighted, pulsing border).
- `.ring-ellipse.ring-60`, `.ring-300`, `.ring-600`, `.ring-900`, `.ring-1200`
  — each owns its own shade variable from the palette ladder so per-ring
  colors are addressable.
- `.ring-label` + per-ring modifiers — text at 12 o'clock of each ring.
- `[data-ring-fill="off"]` on `#mapRingOverlay` flips fill-opacity to 0
  across all rings (stroke unchanged).
- `.ring-connector` (thin stroke between anchors when both set).
- `.ring-compare-readout`.

Reuse `.is-filter-dimmed` pattern only if needed; v1 keeps note markers fully
visible — rings are an overlay, not a filter.

## Theme & palette

**Name: Rangefinder Mode.**

Color tokens (proposed, finalize during Phase 2 dogfood):

```css
:root {
  --accent-ring: #f59e0b;            /* base amber — pill + anchor-1 pin */
  --accent-ring-secondary: #d97706;  /* deeper amber — anchor-2 pin */
  /* Ring stroke colors */
  --ring-60-stroke:   #b45309;       /* inner, most saturated */
  --ring-300-stroke:  #d97706;
  --ring-600-stroke:  #f59e0b;
  --ring-900-stroke:  #fbbf24;
  --ring-1200-stroke: #fcd34d;       /* outer, palest */
  /* Ring fill colors (same hues, low opacity) */
  --ring-60-fill:   rgba(180, 83, 9, 0.18);
  --ring-300-fill:  rgba(217, 119, 6, 0.14);
  --ring-600-fill:  rgba(245, 158, 11, 0.11);
  --ring-900-fill:  rgba(251, 191, 36, 0.09);
  --ring-1200-fill: rgba(252, 211, 77, 0.07);
  --ring-connector: #92400e;
  --ring-label-bg:  var(--bg);       /* via paint-order stroke */
}
[data-theme="dark"] {
  --accent-ring: #fbbf24;
  --accent-ring-secondary: #f59e0b;
  --ring-60-stroke:   #fde68a;
  --ring-300-stroke:  #fcd34d;
  --ring-600-stroke:  #fbbf24;
  --ring-900-stroke:  #f59e0b;
  --ring-1200-stroke: #d97706;
  --ring-60-fill:   rgba(253, 230, 138, 0.18);
  --ring-300-fill:  rgba(252, 211, 77, 0.14);
  --ring-600-fill:  rgba(251, 191, 36, 0.11);
  --ring-900-fill:  rgba(245, 158, 11, 0.09);
  --ring-1200-fill: rgba(217, 119, 6, 0.07);
  --ring-connector: #fde68a;
}
```

- Distinct from Wayfinder teal so both modes can coexist visually.
- Amber ladder reads as a rangefinder reticle / signal range — saturated
  near the center, softer at distance. Inner ring most-actionable (1hr/day
  trip), outer rings aspirational (a long drive away).
- Per-ring stroke + fill tokens are CSS custom properties so future
  per-ring color customization needs no JS changes.
- When the **Fill rings** toggle is off (`[data-ring-fill="off"]`), CSS
  sets `fill-opacity: 0` globally on `.ring-ellipse` — strokes remain.

## Mode interaction matrix

| State                                      | Behavior                                                                                                  |
|--------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| Rangefinder off                            | No change anywhere.                                                                                       |
| Rangefinder on, anchor 1 null              | Panel shows `"Pick a pin to ____"`. Anchor 1 slot starts armed. No rings drawn.                            |
| Rangefinder on, anchor 1 set, slot armed   | Next note-pin tap fills the armed slot (does not open marker dialog).                                     |
| Rangefinder on, anchor 1 set, no slot armed| Rings render around anchor 1 with labels at 12 o'clock. Note-pin taps open the marker dialog as usual. State taps cycle level. |
| Rangefinder on, both anchors set           | Anchor 1 rings + anchor 2 pin + connector + compare readout. Tap any anchor slot to re-arm.               |
| Anchor 2 × clear                           | Slot 2 empties; compare readout + anchor-2 pin + connector hide. Rings remain.                            |
| Rangefinder on + Wayfinder on              | Both pills render. Wayfinder filters apply to markers; rings draw over them. No conflict.                 |
| Rangefinder on + Match Notes               | Independent. Rings draw regardless of filter state.                                                       |
| Anchor in AK/HI/territory                  | Panel shows inset-warning microcopy; rings render inside that inset only (correctly scaled there).        |
| User switches to World layer               | Rangefinder auto-disables. Panel hides. Toggle button disabled until US is active again.                  |
| Rangefinder toggled off                    | Rings + anchor pins + connector + panel removed. Persisted anchors stay for next activation.              |
| Fill rings unchecked                       | All ring fills go to 0 opacity. Strokes + labels stay.                                                    |

## Phasing

1. **Phase 1 — schema + helpers + button + panel scaffold + slot-pick wiring.**
   Build the toggle button (`__TARGET`, `data-shortcut="5"`), the paired
   panel container, the responsive 50/50 split with the legend, persistence,
   dispatch-table reassignment, and the armed-slot pick flow (anchor refs
   resolve and persist). Anchor-1 has no clear; anchor-2 has × clear.
   Nothing renders on the map yet — but tapping a slot and then a note pin
   updates the panel text. Dismissable disclaimer hint wired. `APP_VERSION
   4.2.0.1`.
2. **Phase 2 — anchor pins + ring rendering + ring chip toggles + fill
   toggle + labels + palette.** Render `__TARGET` anchor-1 pin, the
   five-ring filled-band ellipse stack with the Rangefinder amber ladder,
   north-of-ring labels (`60mi / 1hr` …), anchor-2 pin in secondary color,
   connector line, and the **Fill rings** checkbox. Chips wired. Lock final
   palette here. `4.2.0.2`.
3. **Phase 3 — compare readout + edge cases.** Distance + time readout
   ("985 mi · ~16h 25m at 60mph"), AK/HI/territory inset handling,
   world-layer auto-disable. `4.2.0.3`.
4. **Phase 4 — Help Center copy, roadmap seed update (target version 3.2.0
   → 4.2.0 and/or mark done per release pattern), CHANGELOG collapse for
   the 4.2.0 "Rangefinder" cut release with themed `notice.cta` (e.g.
   "Range the Map!" / "Sight the Line!").**

Each build phase: `APP_VERSION` bump, `CHANGELOG` entry, push commit summary
container per handoff rules.

## Invariants & gotchas

- Storage key stays `usStateVisitMap.v1`.
- Anchors are always note refs — never raw lat/lng or state centers. If a
  referenced note gets deleted, that slot clears on next `normalizeState()`
  / next access.
- Anchor pins render in the ring overlay group; rings and connector render
  behind note markers so data pins stay on top.
- Slot-arm interception must short-circuit the marker dialog. The
  click-to-dialog path lives in `handleLocationMarker`
  ([index.html:17645](index.html:17645)) / `openMappedNote` — gate at the
  marker click handler before either fires.
- `mapZoom` changes don't require ring recomputation (rings are in SVG
  user-space; CSS zoom scales them like everything else); but the marker
  scale uses `markerZoomScale()` ([index.html:17578](index.html:17578)) —
  apply the same factor to the anchor pin glyphs so they read consistently.
- `tileCenterCache` ([index.html:17394](index.html:17394)) caches per-state
  geometry; not directly used here since anchors are pins, but leave it
  alone.
- Backup/restore preserves Ring Mode settings.
- Public CHANGELOG copy: describe features and behavior, not tickets or
  prompts.
- Reassigning the `"5"` dispatch entry is the only Shortcut-Mode change.
  The layer toggle keeps its advertised `~` key — no visible UI change.

## Open questions

1. **Label legibility on dark/light tiles.** Plan uses `paint-order:
   stroke fill` with a near-background stroke so labels stay readable on
   any tile color. Confirm during Phase 2 — may need a small `<rect>`
   chip behind each label if stroked outline reads as muddy.
2. **What if the anchor-1 note gets deleted while Rangefinder is active.**
   Plan: clear slot 1, auto-arm, panel shows "Anchor note was removed —
   pick another pin." Same behavior on anchor-2 deletion (but doesn't
   auto-arm since slot 2 is optional). Confirm.
3. **Label collision when zoomed out.** All five labels at 12 o'clock on
   concentric ellipses could stack visually at low zoom. Plan: render
   each label with its own y-offset (no overlap math) and trust the user
   to zoom in. If it's ugly in Phase 2, add a "labels: hover-only"
   degrade or hide labels below a zoom threshold.
4. **Hint copy variant.** Current: "Distances are straight-line ('as the
   crow flies') and times assume 60 mph. Not actual driving distance."
   Lock or revise during Phase 1.

## Test plan (manual)

- Toggle Rangefinder on/off — panel appears/disappears, legend resizes
  50/50 and back. Disclaimer hint appears on first activation; once
  dismissed, small footer microcopy persists.
- Resize between desktop and mobile widths — panel reflows above/right of
  legend at 981px.
- Move the legend to a different corner — Rangefinder panel rides along.
- On first activation with no anchors, anchor-1 slot is armed. Tap a note
  pin → slot fills, rings render with `60mi / 1hr`-style labels at
  12 o'clock of each enabled ring.
- Tap the empty anchor-2 slot → it arms. Tap a different note pin → slot
  fills, compare readout appears, anchor-2 pin + connector render.
- Tap anchor-2 × clear → slot 2 empties; compare + connector + anchor-2
  pin disappear; rings remain.
- Tap anchor-1 in the panel → it arms. Tap a different pin → anchor 1
  replaces (no clear option). Rings move with it.
- There is no × on anchor-1 — verify visually.
- Tap anchor-2 in the panel → arm + repick.
- Toggle each ring chip → corresponding ring + its label shows/hides.
- Toggle **Fill rings** off → fills go to 0 opacity, strokes + labels
  remain. Toggle back on → fills return.
- While a slot is armed, tap an empty area / Escape → slot disarms,
  marker-dialog behavior returns to normal.
- While no slot is armed, tap a note pin → marker dialog opens as usual.
- State tap in Rangefinder → log-level cycles as normal (no hijack).
- Switch to the World layer → Rangefinder auto-disables, panel hides,
  button disabled with hint.
- Set anchor in Hawaii / Puerto Rico → inset-warning microcopy appears,
  rings render inside that inset.
- Delete the anchor-1 note → slot 1 clears + auto-arms with the "Anchor
  note was removed" message. Delete the anchor-2 note → slot 2 clears
  silently (no auto-arm since slot 2 is optional).
- Reload → mode state, both anchors, ring chip selection, fill toggle,
  dismissed-hint state all restored.
- Backup → wipe → restore: full Rangefinder state survives.
- Wayfinder + Rangefinder both on at once: no visual conflict, both pills
  visible in the layer toggle, Wayfinder teal + Rangefinder amber palette
  coexist cleanly.
- Press `5` in Shortcut Mode → Rangefinder toggles.
