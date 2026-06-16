# WISH-077 — Mark Roadmap Items That Have a Plan (target: patch)

Ticket: **WISH-077** "Mark Roadmap Items That Have a Plan". Target: **patch** bucket (P0, small). Surface a badge in the in-app Roadmap on any wish that already has a written plan doc behind it, so spec'd ideas are obvious at a glance.

## Goal

In the Roadmap (Settings → What's New → Roadmap), show a clear **"Plan ready"** badge on every wish whose plan has been written, driven by a new optional field on the roadmap seed, searchable and (optionally) filterable. Roadmap-display only — no user-data change.

## The core constraint

The app is offline and **cannot read the filesystem**, so it cannot detect `context/WISH-###-*-PLAN.md` files at runtime. The "has a plan" signal must live **in the seed data** (`WISHLIST_SEEDS` in `assets/js/roadmap.js`) as an explicit field, set by the author when a plan is written. `WISHLIST_SEEDS` are **developer-facing defaults, never persisted in user backups** (per handoff), so there is **no `defaultState`/`normalizeState`/schema impact** — this is purely a Roadmap-render + data-shape change.

## Current state (read before `start`)

- `renderWishlist()` — index.html:13140. Builds each card at index.html:13193–13208:
  - title row: `<span class="tag">ticketId</span><b>title</b>` (13196),
  - `.chips` row of `<span class="tag">` pills: Category, Priority (`.priority-pill`), Target, Effort (13199–13204),
  - Cost + Prompt fields.
- Search blob (index.html:13176) concatenates ticketId/title/description/category/priority/effort/targetKind/targetVersion/prompt.
- Filters: `#wishPriorityFilter`, `#wishCategoryFilter`, `#wishTargetFilter`, `#wishEffortFilter`, `#wishSort`, `#wishSearch` (rebuilt at 13163–13174). `#wishResultCount` shows the tally.
- Seed shape (handoff + `roadmap.js`): `title, ticketId, description, priority, effort, targetKind, targetVersion, tokenCostPct, prompt, category`.
- Pill styling: `.tag` (+ `.priority-pill`) in `assets/css/app.css`.

## Behavior / UX

- New optional seed field **`planDoc`** = the plan filename string (e.g. `"WISH-063-THEMING-OVERHAUL-PLAN.md"`); absent/empty = no plan. (String over a bare boolean so the value documents *which* doc, and a future "open plan" affordance is possible.)
- Card renders a distinct **"Plan ready"** pill in the `.chips` row when `planDoc` is set — visually separated from the metadata pills (e.g. accent-tinted, optional small doc glyph). Keep it readable in light/dark.
- Include `planDoc` (and/or a literal "plan ready") in the **search blob** so searching "plan" surfaces planned wishes.
- Optional: a **"Has plan"** filter (select or toggle) and/or a sort that floats planned items; `#wishResultCount` already covers counts.

## Implementation phases (for `start`)

1. **Data shape**: document `planDoc` in the seed shape (handoff + a comment in `roadmap.js`); **backfill** the wishes that already have plans — WISH-063, WISH-077, WISH-078 (and any others in `context/`).
2. **Render the badge**: add the "Plan ready" pill in the `.chips` row in `renderWishlist`; add a `.tag` modifier class + CSS.
3. **Search/filter**: add `planDoc` to the search blob; optionally add the "Has plan" filter/sort control (mirror the existing filter wiring).
4. **Process**: update the `plan` workflow in the handoff so authoring a plan also sets the seed's `planDoc` — keeps the badge truthful going forward.

## Open questions / risks

- **`planDoc` vs `hasPlan` boolean** — recommend the filename string (more useful, enables a later "view plan" link). Confirm.
- Add a dedicated **filter**, or rely on search + the badge? (Recommend search + badge first; filter is cheap to add.)
- Risk: the flag is **manual** — it can drift from reality. Mitigate by folding the set into the `plan` workflow and backfilling now.
- Keep it **Roadmap-only**: do not touch `defaultState`/`normalizeState` or `usStateVisitMap.v1` (seeds are not user state).

## Verify (at `start`)

- `./build/check.sh` parses. Roadmap shows the "Plan ready" pill on WISH-063/077/078 and not on plan-less wishes.
- Searching "plan" surfaces planned wishes; the optional filter (if built) scopes to them; counts stay correct.
- Light/dark both legible; mobile chips wrap cleanly. No persisted-data change (load old data → identical).
