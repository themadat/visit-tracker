# WISH-074 — Slim index.html for Agentic Coding (No-Build Split) — PLAN

Status: implementing on branch `4-4-1-llm-opt` (line 4.4.1.x).

Goal: cut `index.html` from ~971k tokens to ~280k by moving inert data into
plain companion scripts. Zero behavior change, no build step; `file://` and
GitHub Pages both keep working (classic `<script src>` tags, no modules).

## Moves (verbatim line moves)

- `assets/js/icons.js` — the 873 `__*` SVG icon consts (~1.67 MB) plus a
  generated `CIRCLE_ICON_SVGS` registry (`id -> __ID_CIRCLE` for every
  `__*_CIRCLE` const).
- `assets/js/maps.js` — `__US_AND_WORLD_MAP_MARKUP` template literal holding
  the `#stateMap` + `#worldMap` markup (~1 MB), injected into `.map-wrap` as
  the first statement of the main script (script runs at body end, so the
  container exists; init/bindings run after).
- `assets/js/changelog.js` — `const CHANGELOG` (~100 KB).
- `assets/js/roadmap.js` — `const WISHLIST_SEEDS` (~22 KB).
- Four `<script src="assets/js/...">` tags inserted just before the main
  script. Top-level consts in classic scripts share the global lexical scope,
  so all existing references resolve unchanged.

## Code changes

- `autoCircleIconIds()`: now `Object.keys(CIRCLE_ICON_SVGS)` — the old
  version regex-scanned `document.currentScript.textContent`, which is empty
  for external scripts.
- `circleIconSvg()`: registry lookup; `eval` removed.
- `basecampPadIcon()`'s `eval(key)` is unchanged — direct eval resolves
  global lexical const bindings declared in earlier classic scripts.
- Help Center / FAQ markup stays inline (~6k tokens; not worth injection
  complexity).

## Verify

`jsc` parse-check each companion file and the wrapped main script; serve on
8018; console clean; smoke: state click, layer toggle, More Icons grid
populated (registry), Release Notes + Roadmap render, Basecamp pad icons.

## Risks

- innerHTML SVG injection timing — mitigated: injection is the first
  main-script statement and the main script sits at body end.
- Icon discovery regression — registry is generated from the extracted const
  names; counts asserted during extraction.

## Resume

**Implemented and verified at 4.4.1.1 (2026-06-09).** All four companions
extracted; registry + discovery patch in; `eval` removed from
`circleIconSvg`; APP_VERSION bumped; CHANGELOG "Ultralight" entry and
WISH-074 seed added. Verified: `jsc` parse on all 5 files; browser smoke on
8018 — zero console errors, 654 registry icons, 56 US tiles + 2,316 world
regions injected, state/country marking persists, layer toggle works,
release notice renders from changelog.js. Results: `index.html`
3.89 MB/971k tokens → 1.12 MB/281k tokens.

**4.4.1.4:** CSS split out too — all styles now in `assets/css/app.css`
(~64k tokens) via a head `<link>`; `index.html` is down to ~16.2k lines
≈ 216k tokens. Verified: check.sh parse-clean; browser smoke — stylesheet
loads (1,318 rules), themed render, map/legend/notice intact, console clean.
(4.4.1.2–.3 in between: icon art → `assets/icons/`, `icon/` retired, deploy
excludes, `build/check.sh`, `.rgignore`.)

**4.4.1.5:** dead-code pass — 56 unreferenced icon consts parked in
`build/icon-sources/parked-icon-consts.js` (not loaded, deploy-excluded;
move a const back into icons.js to revive it), 17 uncalled functions and
the orphaned `CIRCLE_ICON_ID_SET` deleted. `icons.js` ≈384k tokens,
`index.html` ≈214k. Verified: check.sh + parked file parse clean; browser —
654 More Icons discovered, registry/pack/Basecamp icons work, console clean.

**4.4.1.6:** CHANGELOG schema flattened — `notice` objects gone; entries are
`{ version, date, title, summary, banner, cta, highlights, updateSections }`
and the What's New banner derives pill/title/dismissal keys from the entry
(`latestFeatureNotice()` is the single source). All 16 notices migrated after
asserting version/title matched. Handoff Release Notes + prep/ship rules
updated to the new shape. Verified: check.sh; browser — banner renders v4.4.1
"Ultralight", dismissal round-trip works on derived version, console clean.

Remaining on this line: `prep` (Help/FAQ/hints/README/banner polish), then
`ship` to cut 4.4.1.
