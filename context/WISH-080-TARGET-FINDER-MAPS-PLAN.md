# WISH-080 — Target Finder Maps / Flights Integration (target 5.1.0)

Ticket: **WISH-080** "Target Finder Google and Apple Maps Integration". Target:
**5.1.0** (P0). Give Rangefinder's two Target Finder points a **user-initiated
handoff to external trip tools**: open the preferred maps provider with the
confirmed Start/End coordinates and driving intent in **Drive** mode, and open
**Google Flights** in **Plane** mode. Straight-line rings, distance/time
compare, offline time zones, and persisted anchors are **unchanged** — this only
adds an outbound link action plus one persisted preference.

## Decisions locked with the user

- **Provider switch lives in Settings** (the **Map Interaction** category), not
  in the Rangefinder header. One global `settings.mapsProvider`
  (`"apple" | "google"`).
- **Plane mode opens Google Flights only** (single tab) — no second map tab.
- The Rangefinder summary row is **re-wired** (below): the compare readout
  becomes the Local Times opener; the small right-hand button becomes the
  external maps/flights handoff ("the websites button").
- Click semantics on the websites button: **single click → open in a new tab
  and switch to it**; **right-click → open in a background tab** (suppress the
  native context menu).

## Current surface (read before `start`)

Everything lives in `renderRingPanel()` / the Rangefinder helpers in
`index.html`, with styles in `assets/css/app.css`.

- **Summary row** built in `renderRingPanel()` (index.html:5132-5135):
  ```
  <div class="ring-summary-row{is-zone-only}">
    {compare ? <div class="ring-compare-readout">…distance · time · Δzone…</div>}
    {timeZoneToggle}            ← renderRingTimeZoneToggle()
  </div>
  ```
- **`ringCompareReadout()`** (index.html:4861) returns the distance/time/zone
  string; empty when fewer than two anchors.
- **`renderRingTimeZoneToggle()`** (index.html:4915) renders the 32px
  `.ring-timezone-toggle` button (icon `__POINT_TOPLEFT_DOWN_TO_POINT_BOTTOMRIGHT_CURVEPATH`,
  `data-ring-timezone-toggle`, `aria-controls="ringTimeZonePopover"`). It toggles
  `ringSettings().timeZoneOpen`.
- **Toggle handler**: click delegation at index.html:20316 →
  `setRingTimeZoneOpen(…)` (index.html:4207). The popover **close** button
  (index.html:4968) also carries `data-ring-timezone-toggle` — leave it as-is.
- **Anchors**: `ringAnchorFor(slot)` (index.html:4094) returns
  `{ abbr, noteId, layer, label, lat, lng }`; `ringAnchorNote()` (4113) resolves
  the source note (`city`/`where`); `ringRegionName()` (4104) and
  `ringAnchorLabelFromNote()` (4109) give human place names. `ringTravelIsPlane()`
  / travel mode comes from the per-layer bag.
- **Existing link patterns to reuse**: Google Maps search URL already used at
  index.html:10045 (`https://www.google.com/maps/search/?api=1&query=lat,lng`);
  the app/web deep-link-with-fallback pattern is `launchTip()` (index.html:19033,
  scheme → `window.location.href`, timed `window.open` web fallback).
- **Settings dialog**: `<section class="settings-category">` blocks with `<h3>`
  + `.setting-row` + `.segmented` button groups (index.html:1073-1082 is the
  **Map Interaction** category; "Tap to" Cycle/Select is the model to copy).
  Settings buttons wire up in bindEvents alongside `cycleModeBtn`/`selectModeBtn`;
  writes go through `updateSetting(key, value)`.
- **Persistence**: global settings default at index.html:2838-2843
  (`ringMode`, `ringByLayer`, …); coercion in `normalizeState()` near
  index.html:3261 (`next.settings.ringMode = …`). Schema key `usStateVisitMap.v1`.

## Behavior / UX

### Summary-row re-wire (the two buttons swap roles)
- **Compare readout → Local Times opener.** Change `.ring-compare-readout` from
  a `<div>` to a `<button>` carrying `data-ring-timezone-toggle`,
  `aria-haspopup="dialog"`, `aria-controls="ringTimeZonePopover"`, and
  `aria-expanded`. It keeps showing the distance · time · Δzone text and now
  **opens "Local Times & Arrival"** on click (reuses the existing handler — no
  new wiring). When there are fewer than two anchors (no compare text), still
  render this button with a short label (e.g. "Local times & arrival") so the
  popover stays reachable; the popover already renders its own empty/"Pick
  Start" state.
- **Right button → websites/maps handoff.** Replace the timezone toggle in the
  summary row with a new `.ring-maps-btn` (same 32px square footprint) whose icon
  is the **preferred provider logo**: `__APPLE_LOGO` for Apple, `__G_SQUARE_FILL`
  for Google. New delegated handler keyed on a `data-ring-maps-open` attribute.

### Websites button behavior
- **Drive mode**, two anchors → open **driving directions** Start→End in the
  preferred provider.
- **Plane mode**, two anchors → open **Google Flights** searching Start→End by
  place name (Flights needs city/airport names, not coordinates — use
  `ringAnchorLabelFromNote()` / `ringRegionName()`).
- **One-point fallback** (only Start set, either mode) → open the **provider's
  single-place** view for that coordinate (no directions, no flights).
- **No anchors** → button disabled (`aria-disabled`, no-op).
- **Single click** → open in a **new tab and focus it**:
  `const w = window.open(url, "_blank", "noopener"); w && (w.opener = null);`
  (default browser behavior switches focus to the new tab).
- **Right-click (`contextmenu`)** → open in a **background tab**: build a
  transient `<a href target="_blank" rel="noopener">` and dispatch a synthetic
  `MouseEvent("click", { button:0, ctrlKey:!isMac, metaKey:isMac })`; call
  `event.preventDefault()` on the contextmenu event to suppress the native menu.
  Best-effort (a browser/OS may still foreground or block) — acceptable.
- **Mobile / no right-click**: tap = the single-click path. The https provider
  URLs open the native Maps app via OS universal-link handling; an optional
  `launchTip()`-style explicit app scheme (`maps://`, `comgooglemaps://`) with a
  timed web fallback is a possible enhancement, not required for v1.

### URL builders (one small helper each, pure)
- Google directions: `https://www.google.com/maps/dir/?api=1&origin=LAT,LNG&destination=LAT,LNG&travelmode=driving`
- Google place: `https://www.google.com/maps/search/?api=1&query=LAT,LNG`
- Apple directions: `https://maps.apple.com/?saddr=LAT,LNG&daddr=LAT,LNG&dirflg=d`
- Apple place: `https://maps.apple.com/?ll=LAT,LNG&q=ENCODED_LABEL`
- Google Flights: `https://www.google.com/travel/flights?q=` +
  `encodeURIComponent("Flights from <Start label> to <End label>")`
- All coordinates `encodeURIComponent`'d; labels trimmed/encoded. Build a tiny
  `ringExternalLinks()` that returns `{ url, label }` for the active mode +
  provider + anchor count, so click/right-click share one source of truth.

### Provider setting (Settings → Map Interaction)
- New `.setting-row` "Maps Provider" with a `.segmented` Apple/Google pair
  (mirror "Tap to"); buttons get ids (e.g. `mapsProviderAppleBtn` /
  `mapsProviderGoogleBtn`), wired in bindEvents to
  `updateSetting("mapsProvider", …)`, `aria-pressed` synced in the settings
  render. Add a short `setting-hint` noting these are online handoffs.

## Persistence & migration
- **New field** `settings.mapsProvider`. `defaultState()` (index.html:2838 area):
  default **platform-aware** — `"apple"` on Apple platforms (mac/iOS UA), else
  `"google"`. `normalizeState()` (index.html:3261 area): coerce to exactly
  `"apple"` or `"google"`, falling back to the platform default on anything else.
- This is the **only** schema change. The summary-row re-wire and link logic add
  no persisted state. **Preserve `usStateVisitMap.v1`**; old saves load
  unchanged. JSON backup rides `settings` automatically (verify round-trip).

## Implementation phases (for `start`)
1. **Provider setting**: add `settings.mapsProvider` (default + normalize), the
   Settings → Map Interaction row, bind handlers, `aria-pressed` sync.
2. **URL helpers**: `ringExternalLinks()` + the per-provider/mode builders
   (pure, unit-testable with `jsc`).
3. **Summary-row re-wire**: compare readout → `<button>` Local Times opener
   (reuse `data-ring-timezone-toggle`); swap the right button to `.ring-maps-btn`
   with the provider logo + `data-ring-maps-open`; update `.ring-summary-row`
   CSS if the swap needs it (footprint is already 32px).
4. **Click + contextmenu handlers**: single-click foreground open; contextmenu
   background-tab open with `preventDefault`; disabled state for 0 anchors.
5. **Surfaces** (at `prep`/`ship`): Help/FAQ entry, `data-hint` copy, What's New
   banner + cta (5.1.0 is a minor → carries `banner`/`cta`), README, mark
   WISH-080 done / keep target in `roadmap.js`.

## Open questions / risks
- **Default provider**: platform-aware (recommended) vs always Google — confirm
  at `start` if undesired.
- **Plane-mode one-point fallback**: open provider single-place (recommended)
  vs disable the button — currently planned as single-place.
- **Background-tab reliability**: ctrl/cmd-synthetic-click is best-effort;
  pop-up blockers and browser tab-focus settings can override. Single URL per
  action keeps us within the one-gesture pop-up allowance (no multi-tab risk now
  that Plane = Flights only).
- **Suppressing native right-click** on the button is deliberate; keep it scoped
  to `.ring-maps-btn` only.
- **Google Flights deep-linking** has no official prefilled-itinerary API; the
  `?q=Flights from X to Y` search query is the stable approach and depends on
  good place labels (fall back to region name when a note lacks city/where).
- Keep everything offline/`file://`-safe except the click itself (the only
  online action); wording must read as an explicit user-initiated handoff.

## Verify (at `start`/`prep`)
- `./build/check.sh` parses. URL helpers return correct strings for
  Apple/Google × Drive/Plane × one/two anchors (unit test).
- Drive: click opens provider directions in a focused new tab; right-click opens
  a background tab and shows no native menu. Plane: opens Google Flights.
- One anchor → single-place handoff; zero anchors → disabled.
- Compare readout now opens Local Times & Arrival; the popover close still works;
  `timeZoneOpen` persists.
- Settings Apple↔Google toggle flips the button logo and the opened provider;
  reload persists; JSON export→import round-trips `mapsProvider`; pre-5.1.0 data
  (no field) loads with the platform default and never errors.
- Smoke: desktop view stays viewport-locked; Rangefinder summary row layout
  intact on US + World; mobile tap opens the provider.
