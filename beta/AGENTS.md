# Trail Log — Agent Instructions

Local-first, no-build travel-tracking app: `index.html` (~16k lines, ≈216k
tokens — markup + app logic) plus companions: `assets/css/app.css` (≈64k
tokens, all styles) and plain data scripts in `assets/js/` (`icons.js` ≈426k
tokens, `maps.js` ≈241k, `changelog.js` ≈25k, `roadmap.js` ≈6k). **None of
the big files fit in a context window — never read them whole.**

This file is the thin, always-loaded summary for both Codex (`AGENTS.md`) and
Claude Code (`CLAUDE.md` imports it). `context/LLM_HANDOFF.md` is the source of
truth — read it before implementing anything.

## Session start

1. `git status --short` — manual edits are authoritative; preserve dirty work.
2. Read `context/LLM_HANDOFF.md` — workflows (`wish` / `plan` / `start` /
   `prep` / `ship` / `pause`), invariants, code map, verify steps.
3. If resuming an in-flight line: `git log --oneline -5`,
   `git diff main...HEAD --stat`, then the `## Resume` block in the active
   `context/*-PLAN.md`.

## Token discipline

- Search first (`rg -n "pattern" index.html assets/js/`), then read tight
  line ranges (≲200 lines). Never paste large chunks back into chat.
- `index.html` landmarks: HTML body ≈ lines 36–1.6k · main `<script>` ≈
  1.6k–16.2k. Styles are in `assets/css/app.css`. Icon art (`icons.js`) and
  map art (`maps.js`) are inert data — jump by symbol name, never scroll them.
- Edit surgically. Never reformat `index.html` or the `assets/js/` companions,
  and never run a formatter on them.

## Core rules (summary — handoff is authoritative)

- App-behavior changes bump the 4th `APP_VERSION` segment (in `index.html`)
  and add a `CHANGELOG` build note (in `assets/js/changelog.js`). Docs-only
  edits need no release churn.
- New persisted fields: defaults in `defaultState()`, repair in
  `normalizeState()`; never break the `usStateVisitMap.v1` schema.
- Preview: `python3 -m http.server 8018` → `http://127.0.0.1:8018/index.html`;
  stop the server before the final reply. Parse-check: `./build/check.sh`
  (`jsc`-based; `node` may be absent).
- End every working session with the two copy-paste blocks: commit
  description list, then `_vt-checkpoint APP_VERSION - <title>`.
- Hitting a usage limit mid-feature? Run the handoff's `pause` workflow so
  the other tool can resume cold.
