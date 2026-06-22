# WISH-063 — App-Wide Theming Overhaul (target 5.0.0)

## Status — `start` complete (build `5.0.0.1`), `prep`/`ship` pending

Implementation **done and browser-verified** (apply theme, edit swatch with
derivation, ring-ramp re-derive, reset, flat persistence reload, legacy
`{light,dark}`→flat migration, no-scroll at desktop height). The modal was
**redesigned per user feedback** from the first grouped/per-mode version into a
compact single-palette theme picker.

Final design (supersedes the original plan body below):
- **Flat single palette** — `settings.palette` is a flat `{ "--var": "#hex" }`
  bag applied the same in light and dark (no per-mode split). `normalizePalette`
  folds the legacy `{light,dark}` shape (light wins) and drops unknown/invalid.
- **No app-surface editing and no contrast badges** (removed per feedback).
- **Derived companions** — the user edits only primaries; `deriveAccentVars`
  (→`--accent-2`), `deriveWayfinderVars` (→`--wayfinder-accent-strong`/`-deep`),
  and `deriveRingVars` (2 endpoints → `--accent-ring`/`-secondary`,
  `--ring-connector`, 8 `--ring-step-N-stroke` via `paletteRamp`) fill the rest.
- **Modal** = a **Current Theme** row of editable swatches (5 levels · 5
  priorities · 2 Rangefinder endpoints · 1 Wayfinder · 1 Accent) + a list of
  **7 one-click theme strips**: Classic, Neon, Pastel, Sunset, Space, Forest,
  Ocean (`COLOR_THEMES`, each = levels[5]/priorities[5]/ring[2]/wayfinder/accent).
  `Reset` clears the override bag (levels untouched). Legend "Auto Colors"
  removed; `>` (universal + Shortcut-Mode) opens the modal.

Key symbols (all `index.html`): `THEMEABLE_VARS` (21, no surfaces), `COLOR_THEMES`,
`DEFAULT_THEME`, `PALETTE_DEFAULT_VARS`, `normalizePalette`/`normalizePaletteHex`,
`applyPaletteOverrides` (in `render()`), `paletteMix`/`paletteRamp`/`derive*Vars`,
`paletteVarValue`, `setPaletteVars`, `editPaletteSwatch`, `applyColorTheme`,
`resetColorTheme`, `renderPaletteCurrent`/`renderPaletteThemes`/`renderPaletteDialog`,
`assignLevelPalette`. CSS: `#paletteDialog` + `.palette-current*`/`.palette-cluster*`/
`.palette-theme-*`/`.palette-swatch` in `assets/css/app.css`. Persisted field
`settings.palette` (flat); `usStateVisitMap.v1` schema unchanged. Wayfinder teal
and note priority colors are CSS vars in both `:root` and `[data-theme="dark"]`.

**Remaining (Phase 7 — `prep`/`ship`):** Help Center + FAQ entry; `data-hint`
copy for `#paletteBtn`/modal; README feature list; refresh handoff Snapshot/
Current Surface; mark WISH-063 done in `roadmap.js` (at ship); collapse the
`5.0.0.1` build line to `5.0.0` and finalize the CHANGELOG. The `CHANGELOG`
"Paint Job" entry already carries the banner/cta + update sections.



Ticket: **WISH-063** "App-Wide Theming Overhaul". Target: **5.0.0** (next major — this is the flagship). Turn theming from "apply a preset to legend levels" into a first-class system where **every color the user perceives is selectable**, driven from a **large palette modal opened from the top bar** (immediately left of Settings), not a small legend pop-up.

## Goal

- **Every color selectable**, grouped by surface: **Legend level colors**, **note Priority colors**, **Rangefinder ring/accent colors**, **Wayfinder accent**, and the **global app accent + surface/text colors**.
- **Relocate the trigger**: move the palette control out of the Legend (`#smartColorsBtn` "Auto Colors", index.html:236) into the **top bar, immediately left of `#settingsBtn`** (index.html:108).
- **Much bigger modal** that shows the **entire color range at once** (grouped sections, live swatches), replacing the small `#paletteDialog` "Smart Color Swatches" (index.html:819–830).
- **Presets**, **accessible-contrast checks**, **light/dark readability**, **persisted selections**, and **every current color preserved as the default** (nothing changes until the user edits).

## Current color architecture (what exists today — read before `start`)

The app already centralizes **most** colors as CSS custom properties; the overhaul mostly **completes** that pattern and adds a persistence/UI layer on top.

- **Light/dark:** `state.settings.theme` = `"light" | "dark"` (default index.html:2655), applied via `document.documentElement.dataset.theme = state.settings.theme` (index.html:6113). CSS defines a full palette in **`:root`** (light, app.css:3) and **`[data-theme="dark"]`** (dark, app.css:45). Toggle is `#darkModeBtn` (index.html:17572).
- **Core vars** (both blocks): `--bg`, `--surface`, `--surface-2`, `--surface-3`, `--accent`, `--accent-2`, plus `--text`/`--line`/`--muted` used throughout.
- **Rangefinder ring vars** (both blocks): `--accent-ring`, `--accent-ring-secondary`, `--ring-step-1..8-stroke`, `--ring-step-1..8-fill`, `--ring-connector`, `--ring-label-bg` (app.css:17–36, 59–78). **Already variable** — good.
- **Priority colors:** `[data-priority="1..5"]` blocks set `--priority-color`/`--priority-bg`/`--priority-text` from **hardcoded hex** (#16a34a / #eab308 / #f97316 / #ef4444 …) with dark-mode `--priority-text` variants (app.css:4553–4595). **Hardcoded, not yet themeable** — must be lifted to named vars.
- **Wayfinder/bucket accent:** styled by `html[data-bucket-mode="on"]` selectors (app.css:1318+) and `.wayfinder-level-option-color` / `#wayfinderLevelDialog` (index.html:6612, 6640). The teal accent is **inlined in those rules** — must be lifted to a named var.
- **Legend level colors:** stored as **per-level state data** `levels[].color` (NOT a CSS var), applied to map regions in JS. Presets live in `const THEMES` (index.html:1811): six named **5-color arrays** (Classic/Neon/Pastel/Sunset/Earth/Ocean). `smartApplyPalette(colors)` (index.html:12891) assigns them in legend order (counting levels fill from the left, excluded from the right). `#paletteThemes` renders the swatch buttons (index.html:12874); shortcut **V** + dispatch at index.html:16852/16663.
- **Top bar:** `<header class="topbar">` (index.html:41) → `<nav class="toolbar">` (96): panel-toggle group (map/legend/notes), then `#basecampBtn` (103), `#tipJarBtn` (106), `#addToHomeBtn` (107), `#settingsBtn` (108). **Insert the new palette button between 107 and 108.**
- **Persistence:** `defaultState()` (index.html:2649, `settings` at 2654), `normalizeState()` (index.html:3037). Schema key `usStateVisitMap.v1` must be preserved.

**Key insight:** two color models coexist — (A) CSS custom properties in `:root`/`[data-theme="dark"]` (accents, surfaces, rings; priority/bucket once lifted), and (B) per-level `levels[].color` state. The modal must edit **both** without breaking the schema.

## Behavior / UX

### The modal (`#paletteDialog` rebuilt — large, grouped)
- Opens from the **top-bar palette button** (left of Settings). Title e.g. "Theme & Colors".
- **Grouped sections**, all visible at once (scroll within one `.dialog-body`): **App** (bg/surfaces/text/line), **Accents** (`--accent`, `--accent-2`), **Legend Levels** (one row per current level, bound to `levels[].color`), **Priorities** (1–5), **Rangefinder** (ring accent + step ramp + connector/label), **Wayfinder** (accent).
- Each color = **swatch + `<input type="color">` + hex text field**, with **live preview** (CSS-var edits apply instantly via `style.setProperty`; level-color edits call `renderMap()`).
- **Light/Dark editing:** edit the **currently-active mode**; provide an explicit mode indicator and a "copy to other mode" / per-mode tab (see Open Questions). Store overrides **per mode**.
- **Presets row** (full-theme presets, see below) + **Reset** (per color, per group, and all → restore captured defaults).
- **Contrast badges:** show a WCAG contrast-ratio check for text-on-surface and accent-on-surface; warn (non-blocking) when below threshold.

### Trigger relocation
- New `<button id="paletteBtn">` immediately before `#settingsBtn`, themed icon (reuse `__SWATCHPALETTE_FILL`), `aria-label`, and a `data-shortcut`. Wire open → `#paletteDialog.showModal()`.
- Decide the fate of the legend `#smartColorsBtn` "Auto Colors" (shortcut **V**): fold its preset-apply into the modal and remove the legend button, or keep it as a shortcut into the Levels group. Update the **Keyboard Shortcuts Reference** (index.html:1532) and Shortcut-Mode dispatch either way.

### Presets
- Extend `THEMES` from level-only 5-color arrays into **full theme objects** (level colors **plus** accent/surface/ring/priority/wayfinder overrides). Migrate the six existing entries as level palettes; add a few full-app presets. Applying a preset writes the whole per-mode override bag (+ level colors).

## Persistence & migration

- New persisted field on `settings`, e.g. `palette: { light: { "<varName>": "<hex>" }, dark: { ... } }`, plus level colors continuing to live in `levels[].color`.
- `defaultState()`: `palette: { light: {}, dark: {} }` (empty = use built-in CSS defaults). Capture the **canonical default theme** (the current `:root`/dark values) as a constant so Reset can restore exactly.
- `normalizeState()`: validate each override (known var name from an allow-list; valid `#rgb`/`#rrggbb`); **drop unknown keys and invalid values**; never throw on bad data.
- `applyPaletteOverrides()` runs in `render()` right after `dataset.theme` is set: for the active mode, `documentElement.style.setProperty(name, value)` for each override; clear stale inline props when an override is removed.
- **Preserve `usStateVisitMap.v1`.** Old saves (no `palette`) load unchanged and look identical (empty overrides → built-in colors). Do **not** auto-recolor state progress (existing invariant).

## Other surfaces (at `prep`/`ship`)
- **JSON export/import & backup** must round-trip `settings.palette` (it's in `settings`, so it rides along — verify). MD/RTF/Text exports are content-only; no theme data.
- Help Center entry + FAQ; `data-hint` copy for the new button/modal; **What's New banner + cta** (5.0.0 is a feature/major release, so it carries `banner`/`cta`); README feature list; mark WISH-063 done in `roadmap.js` at ship.

## Implementation phases (for `start`)
1. **Variable-ize remaining colors** (no behavior change): lift `[data-priority]` hex and the bucket-mode teal into named vars in **both** `:root` and `[data-theme="dark"]`. Verify pixel-identical before/after.
2. **Persistence layer**: add `settings.palette`, `defaultState`/`normalizeState`, the captured-defaults constant, and `applyPaletteOverrides()` in `render()`.
3. **Top-bar trigger**: add `#paletteBtn` left of Settings; move open handler; resolve the legend `#smartColorsBtn`/shortcut-V question; update the shortcuts reference.
4. **Big grouped modal**: rebuild `#paletteDialog` markup + CSS (wider/taller, sectioned, scrollable body) and the render/bind logic (swatch + color input + hex, live apply, reset controls).
5. **Presets**: extend `THEMES` to full theme objects; preset apply writes the override bag + level colors.
6. **Contrast checks**: small WCAG ratio helper + non-blocking badges.
7. **Surfaces**: exports round-trip, Help/FAQ/hints, What's New, README, roadmap mark-done.

## Open questions / risks
- **Per-mode vs single value** (recommend per-mode, since two full palettes already exist) — confirm.
- **Exact exposed-color list**: curated semantic set (above) vs literally every CSS var — recommend curated.
- **Legend "Auto Colors" button + shortcut V**: remove (folded into modal) or keep as a deep-link?
- **Presets**: replace or augment the six existing level palettes? Migration shape for full-theme presets.
- **Include `palette` in backup JSON** (recommend yes — it's user state).
- Risks: dual light/dark surface doubles edit space (needs clear mode UX); level colors use a different model (state vs var) and require `renderMap()` on change while var edits are instant; `color-mix()` already in use (fine); keep everything offline/`file://`, no deps; Reset must restore the exact captured defaults.

## Verify (at `start`/`prep`)
- `./build/check.sh` parses. Modal opens from the **top-bar button** (and via its shortcut); legend no longer owns the trigger (or deep-links as decided).
- Each group edits **live**; **light↔dark** switch preserves per-mode overrides; **Reset** (color/group/all) restores built-in defaults exactly.
- A **preset** applies across all groups + level colors. **Contrast** badge warns on a low-contrast choice.
- **JSON export → import** round-trips overrides; **reload persists**; loading **pre-5.0.0 data** (no `palette`) renders identically and never errors.
- Smoke: map fills recolor on level-color edits; no state-progress recolor; desktop view stays viewport-locked; mobile single-column intact.
