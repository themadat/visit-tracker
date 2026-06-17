# WISH-074 — Pinch-to-Zoom the Map on Touch (target patch)

Ticket: **WISH-074** "Pinch-to-Zoom the Map on Touch". Target: **patch**. Adds two-finger pinch, double-tap/double-click-to-zoom-in, and two-finger-tap-to-zoom-out, all anchored on the gesture point and routed through the existing zoom path.

## Goal

On phones/tablets, let the scrollable map zoom by **two-finger pinch** (scale from finger distance, centered on the pinch midpoint), **double-tap** to zoom in one step (anchored at the tap), and **two-finger tap** to zoom out one step — in addition to the existing zoom pill, drag-pan, and desktop wheel/trackpad zoom. The pinch is continuous while moving and **snaps to a known zoom stop on release** so the readout lands on clean values. Keep `#mapZoomReadout` and the zoom-button states correct, preserve drag panning and persistence, and respect Fit vs scroll modes.

## Current model (what we build on)

- **Zoom**: `setMapZoom(value, anchor)` (`index.html` ≈9257) is the single zoom path. With an `anchor` `{x,y}` in `.map-wrap`-local coords it keeps the anchored point stationary by scaling `scrollLeft/scrollTop` (`ratio = new/prev`, `before = scroll + anchor`, `scroll = before·ratio − anchor`) after `renderMapView()`. It clears `mapFitMode`, persists via `persistMapViewSettings`, and `saveMapPanSoon`. **This is exactly what a pinch needs** — pinch just supplies a live zoom + midpoint anchor.
- **Anchor precedent**: the `wheel` handler (≈6140) already does anchored zoom with `anchor = {clientX−rect.left, clientY−rect.top}` (gated on ctrl/meta). **Trackpad pinch already works on desktop** because browsers deliver it as ctrl+wheel — so this ticket is specifically the **touchscreen two-finger** case (pointer/touch events, no wheel).
- **Pan**: in `bindMapPanZoom`, a single pointer drags by setting `wrap.scrollLeft/scrollTop` from `mapPanState` (with a 3px move threshold, `setPointerCapture`, and a `blockClick` flag to suppress the tile tap after a drag). Disabled in `mapFitMode`.
- **Invariant**: every zoom mutation flows through `syncMapZoomReadout()` (via the render path) — pinch using `setMapZoom` inherits this, keeping the readout/buttons in sync.
- **Persistence**: zoom (`mapZoom`) and pan center already persist through the existing save path; no new state.

## Behavior / UX

### Two-finger pinch (touch)
- Track **active pointers** in a Map (`id → {x,y}`), gated on `event.pointerType === "touch"`. When a **second** touch pointer goes down, **enter pinch**: record `startDist` (hypot of the two points), `startZoom = mapZoom`, and **suspend single-pointer pan** (`mapPanState = null`).
- On `pointermove` of either pointer: update its position, compute `dist`, `scale = dist/startDist`, target `zoom = clampMapZoom(startZoom · scale)`, and call `setMapZoom(zoom, midpointAnchor)` where the midpoint is the average of the two points minus the wrap's rect origin. `preventDefault` to stop native gestures.
- On `pointerup`/`pointercancel`: drop that pointer; when fewer than two remain, **exit pinch** (commit is already persisted), set the `blockClick` flag so the lift doesn't fire a tile tap, and optionally hand the remaining pointer back to pan.

### Snap to known zoom stops (on release)
- The live pinch stays **free/continuous** during the gesture (smooth transient feedback — see Performance), so it never feels notchy. On **release**, snap the committed zoom to the **nearest known stop** so the readout lands on clean values (no 137%) and matches the buttons/readout.
- Define a `MAP_ZOOM_STOPS` ladder of round percentages, e.g. `…50, 75, 100, 150, 200, 300, 400, 600, 800, 1200, 1600…`. Pick the nearest stop **in log space** (so it feels even across the range), anchored at the pinch midpoint so the focal point stays put through the snap.
- Keep it consistent with the tap gestures: **double-tap (×2)** and **two-finger-tap (÷2)** already land on clean values; choose a ladder where doubling/halving a stop stays on the ladder (the example above does: 75↔150↔300↔600, 100↔200↔400↔800), so all four gestures share the same stops.
- **Tuning (confirm at `start`):** the exact stop list and whether snapping is always-on vs. an optional setting. Default: **always snap on release** to the ladder above.

### Double-tap / double-click to zoom in
- Detect two taps/clicks (`pointerdown→up` with <~10px movement) within ~300 ms at ~same spot → `setMapZoom(mapZoom · 2, anchorAtTap)` (anchor = tap point − wrap rect). Suppress the underlying tile tap for the second tap. This must work from Fit mode too, so tap detection cannot depend on scroll-mode drag state.

### Two-finger tap to zoom out (touch)
- Two pointers down then both up quickly with negligible movement (i.e. a pinch that never scaled) → `setMapZoom(mapZoom / 2, midpointAnchor)`.

### Fit vs scroll, clamping, desktop
- Pinch-in / double-tap-in while in **Fit mode** transitions to scroll mode at the new zoom (as the zoom-in button does — `setMapZoom` clears `mapFitMode`). Pinch-out / two-finger-tap-out at/under fit clamps to `MAP_ZOOM_MIN` (no zoom past fit). Two-finger-tap-out in Fit mode is a no-op.
- Pinch/two-finger tap stay touch-gated; double-tap also supports mouse/pen double-click. Trackpad pinch keeps using the ctrl+wheel/gesture paths.

## Key implementation risks (call out for `start`)

- **`touch-action` / browser gesture capture (the big one):** `.map-wrap` uses the tuned `touch-action: pan-y` path so native vertical scrolling stays smooth, while horizontal drag-pan and custom two-finger zoom still reach the handlers. Avoid synthetic page scrolling on pointermove. Also guard iOS Safari's non-standard `gesturestart/gesturechange` (preventDefault) if they still fire.
- **Performance:** `setMapZoom` calls `renderMapView()` (the comment at ≈6137 notes full render per wheel notch was the main lag). Pinch fires moves rapidly → either **throttle to rAF** (one zoom apply per frame) or apply a **transient CSS `transform: scale()`** on the map content during the gesture and commit the real `setMapZoom` on `pointerup`. Recommend the transient-transform approach for smoothness, committing once at the end (with the final anchor) **and snapping to the nearest `MAP_ZOOM_STOPS` value** — the transient transform already makes "free during, snap on commit" natural.
- **Gesture disambiguation:** cleanly separate single-finger pan vs two-finger pinch vs taps (pointer count + movement thresholds + timing); ensure the `blockClick`/tap-suppression covers all gesture ends so a pinch/tap never marks a state/country or opens a note.
- **Pointer bookkeeping:** handle `pointercancel`, lost pointers, and a finger lifting mid-pinch (recompute or end), so state can't get stuck in pinch mode.

## Schema / data

- **No persisted schema change.** Zoom/pan already persist via `setMapZoom`/`saveMapPanSoon`/`persistMapViewSettings`. No `defaultState`/`normalizeState` work. (Optionally a `MAP_PINCH_*` tuning const for sensitivity/clamp.)

## Implementation phases (for `start`)

1. Open the next patch build, CHANGELOG entry (patch -> no banner/cta), bump `APP_VERSION`.
2. CSS: set `touch-action` on `.map-wrap` so two-finger gestures reach our handlers; verify single-finger pan.
3. Multi-pointer tracking in `bindMapPanZoom`; enter/exit pinch; suspend pan during pinch.
4. Pinch zoom: live scale + midpoint anchor (rAF/transient-transform smoothing); on release commit through `setMapZoom` **snapped to the nearest `MAP_ZOOM_STOPS`** (log-space nearest), plus tap-suppression on end. Add the `MAP_ZOOM_STOPS` ladder const.
5. Double-tap/double-click-to-zoom-in and two-finger-tap-to-zoom-out, anchored.
6. Guard iOS gesture events; ensure desktop mouse/trackpad paths stay intentional.
7. Surfaces: Help/FAQ + map-controls hint ("pinch to zoom"), keyboard/gesture reference, README, handoff. Mark WISH-074 done at `ship`.
8. Verify on a real touch device / browser touch emulation (both maps, Fit + scroll, both layers).

## Verify (at `start`/`prep`)

- Touch: two-finger pinch zooms smoothly, centered on the midpoint, and **on release lands on a clean known % (snap)** with the focal point preserved; `#mapZoomReadout` + zoom buttons stay correct; pan still works one-finger; pinch doesn't mark a state/country or open a note.
- Double-tap zooms in one step anchored at the tap; two-finger tap zooms out one step.
- From Fit mode, pinch-in/double-tap-in switches to scroll at the new zoom; tap-out at fit is a no-op; clamps at min/max.
- Zoom/pan persist across reload; works on both US and World maps.
- **Desktop unchanged**: mouse drag-pan, zoom pill, and ctrl+wheel/trackpad pinch behave exactly as before.
- `./build/check.sh`, `git diff --check`, desktop + mobile (375px) smoke on port 8018.
