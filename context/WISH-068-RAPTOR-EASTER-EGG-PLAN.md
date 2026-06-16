# WISH-068 — Raptor Easter Egg (target 4.7.4)

Ticket: **WISH-068** "Raptor Easter Egg" (category Fun, small). Target: **4.7.4**. A tiny, discoverable, non-disruptive delight: **tap the leftmost (westernmost) island in the Hawaii inset on the US map** → the **`__RAPTOR`** pops up above the Hawaii inset with **"You found a Raptor!"**, then goes away. Local-only, accessible, harmless to map/notes/export/keyboard workflows.

## Decisions (from the user)

- **Art:** the parked **`__RAPTOR`** const (`build/icon-sources/parked-icon-consts.js` line 26 — a detailed raptor silhouette, `viewBox 0 0 512 512`, `fill="#000000"`). Bring it into `assets/js/icons.js`; swap `fill="#000000"` → `fill="currentColor"` so it's theme-aware (it's an illustration, not an sf-symbol — give it its own class, e.g. `raptor-art`, rather than `sf-symbol`).
- **Trigger:** click/tap the **leftmost island in Hawaii** (US map).
- **Payoff:** a small popup **above the Hawaii inset** showing the raptor + "You found a Raptor!", which auto-dismisses.

## Key constraint: Hawaii is one path

- `#stateMap` renders Hawaii as a **single `<path class="hi">`** (all islands as one `d`; `<title>Hawaii</title>`, maps.js ≈62). At render it gets `.state-tile` + `data-abbr="HI"` and the normal tap-to-cycle-level behavior. There is **no separate element per island**, so we can't bind to "the leftmost island" directly.
- ⇒ Detect by **click position**: when a tap hits the HI tile (US layer), convert the event point to `#stateMap` user-space coords and test whether it falls in a small **leftmost-island hit region** (the westernmost main island — Niihau/Kauai; the NW Hawaiian islands aren't drawn). Define that region empirically as a small rect in stateMap viewBox coords (read it off the rendered HI bbox — roughly the left sliver of the HI path's bounding box, with a y band). Store as a const (e.g. `RAPTOR_HIT_REGION`).
- **Non-disruptive:** the egg fires **in addition to** the normal HI level-cycle (tapping Hawaii still works exactly as before); we just also pop the raptor when the tap lands in the region. Debounce so spamming that spot doesn't stack raptors (ignore while one is visible / within a couple seconds). No change to any other tile.

## Behavior / UX

- Hook in `handleStateTap(abbr, event)` (≈5622) — or wherever the state tap is handled: if `activeLayerId === "us"`, `abbr === "HI"`, and the event point is inside `RAPTOR_HIT_REGION`, call `showRaptorEasterEgg()` after the normal cycle.
- `showRaptorEasterEgg()`:
  - Position a small popup **above the HI inset** by anchoring to the HI tile's `getBoundingClientRect()` (place it just above the tile, clamped to the viewport). Contents: the `__RAPTOR` art + the caption "You found a Raptor!".
  - **Auto-dismiss** after ~2–2.5 s (fade out), removable early on tap/click; `pointer-events: none` so it never blocks the map.
  - **Accessible:** caption in an `aria-live="polite"` (or a visually-hidden live region) so screen readers announce "You found a Raptor!"; the art is `aria-hidden`. Respect `prefers-reduced-motion` (fade only, no swoop/bounce). No audio. Doesn't move focus or trap it.
  - Debounced via a module flag/timer; safe to call repeatedly.
- **Discoverable but unobtrusive**: most users tap a state's center, so hitting the exact westernmost island is the "find"; it never interferes with marking Hawaii or anything else.

## Schema / data

- **No persisted schema change.** Default: re-triggerable (debounced), no "found" flag stored. (If we ever want a one-time-only discovery, that'd add a settings flag + `defaultState`/`normalizeState` — out of scope unless requested.)

## Implementation phases (for `start`)

1. Open `4.7.4.1`, CHANGELOG entry (patch → no banner/cta), bump `APP_VERSION`.
2. Add `__RAPTOR` to `assets/js/icons.js` (theme-aware `currentColor`); don't reformat the file.
3. Determine `RAPTOR_HIT_REGION` empirically from the rendered HI bbox (left island sliver) in stateMap coords.
4. Hook the HI tap → point-in-region test → `showRaptorEasterEgg()` (additive, debounced); reuse the event→SVG-point conversion the map already uses.
5. `showRaptorEasterEgg()` popup: anchored above the HI inset, raptor art + caption, auto-dismiss, reduced-motion-aware, `pointer-events:none`, aria-live caption.
6. CSS: popup + gentle swoop/fade animation with a reduced-motion fallback; theme-aware.
7. Surfaces: a wink in Help/FAQ is optional (an easter egg is more fun undocumented — skip public docs); handoff note. Mark WISH-068 done at `ship`.
8. Verify (parse + desktop/mobile smoke on 8018; both themes; keyboard/screen-reader sanity).

## Open questions / risks

- **Hit region accuracy**: the leftmost-island rect is hand-tuned; verify it only triggers on that island and not on Kauai/Oahu or empty space. Account for the map zoom/pan transform when converting the tap point (test the point in the SVG's untransformed user space, like markers/tiles do).
- **One-time vs repeatable**: default repeatable+debounced; confirm that's the desired feel (vs. a once-ever discovery).
- **Reduced motion / a11y**: ensure it's purely additive and silent, and never blocks Hawaii's normal marking or screen-reader use.
- **Mobile**: ensure tap (not just mouse click) triggers it and the popup fits/clamps on small screens.

## Verify (at `start`/`prep`)

- Tapping the westernmost Hawaiian island on the US map pops the raptor above the inset with "You found a Raptor!", which fades on its own; Hawaii's level still cycles as normal.
- Tapping elsewhere on Hawaii (or other states) does **not** trigger it; repeated taps don't stack.
- `prefers-reduced-motion`: appears/fades without animation; screen reader announces the caption; map stays fully interactive underneath.
- Works on both themes and on mobile (375px); `./build/check.sh`, `git diff --check`, port 8018.
