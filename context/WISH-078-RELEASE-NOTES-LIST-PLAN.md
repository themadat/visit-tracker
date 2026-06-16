# WISH-078 — Headed Sections in the Full Update List (target: patch)

Ticket: **WISH-078** "Headed Sections in the Full Update List". Target: **patch** bucket (P0, small). Restructure the Release Notes **Full Update List** so it reads as **headed sections with single-level bullets**, not a doubly-indented nested list.

## Goal

In a release card's **Full Update List**, render each `updateSections` entry as a **section header** with its bullet points **one indent level beneath it** (a single level-1 `<ul>`). Today the section heading is itself a bulleted list item and its items are indented *again* under it (two levels). Flatten to: header → level-1 bullets. Flat (section-less) entries and the **Highlights** block keep a simple single-level bullet list. Markup/CSS only — no data or schema change.

## Current state (read before `start`)

- `renderReleaseSection(title, items, collapsible)` — index.html:13084. Used twice in `renderChangelog` (13134–13135): Highlights (flat strings, `collapsible=false`) and Full Update List (`updateSections`, `collapsible=true`).
- `renderItem` (13087–13098):
  - bare string → `<li>string</li>`,
  - section object → `<li class="release-subsection"><b>heading</b><ul>…items…</ul></li>` — **the heading is a list item (bulleted) and items are a nested `<ul>` (second indent).**
- `body` (13099) wraps everything in one outer `<ul>`. Collapsible variant puts `body` inside `<details class="release-section release-collapsible">` with the `summary` + "X sections · Y updates" count (13104–13118).
- CSS (`assets/css/app.css`): `.release-section ul` margin-left `1.1rem` (4685); `.release-subsection` (4690, the bulleted `<li>`); `.release-subsection>b` block heading (4694); `.release-subsection ul` margin-left `1rem` → the **second** indent (4702); `.release-subsection li` (4706).

So sections currently nest `outer <ul>` → `<li>` (heading, bulleted) → `inner <ul>` (items) = two indents + a bullet on the heading. That's what the user wants gone.

## Behavior / UX (target structure)

For a list that contains **section objects**, render (inside the `<details>` body) a sequence of:
```
<div class="release-subsection">
  <b class="release-subsection-heading">Heading</b>   <!-- block header, NO list bullet -->
  <ul> <li>item</li> … </ul>                          <!-- single level-1 indent -->
</div>
```
i.e. **no outer `<ul>` wrapping the sections** (so headings aren't list items). For a **flat string list** (Highlights, or a section-less `updates` array), keep the current single `<ul><li>…</li></ul>`. Preserve the collapsible `<details>`, the chevron, and the "X sections · Y updates" count untouched.

## Implementation phases (for `start`)

1. **Renderer** (`renderReleaseSection`): branch on content. If the list has any section objects, build `body` as concatenated `<div class="release-subsection">header + <ul>items</ul></div>` blocks (bare strings among them fall back to a small standalone `<ul>` or a leading bullet list). If the list is all bare strings, keep the single `<ul>`. Leave the count logic (13104–13113) and the `<details>`/`<div>` wrappers (13114–13126) as-is.
2. **CSS**: drop the heading's list-bullet/extra indent. Make `.release-subsection` a block (not relying on `<li>` markers); `.release-subsection>b` stays a block header; `.release-subsection ul` becomes the **single** level-1 indent (≈1.1rem, matching `.release-section ul`); remove the compounded second indent. Verify spacing between consecutive sections.
3. Confirm **Highlights** (flat strings, non-collapsible) is visually unchanged.

## Open questions / risks

- **Mixed lists** (bare strings + section objects in one entry) are rare but possible — render strings as their own bullets above/among the headed sections; don't crash. Confirm desired placement.
- Keep the **Highlights** path (same function) a simple single-level bullet list — easy to regress; test both.
- Dark mode + mobile spacing; the `<details>` toggle and count must still work.
- Pure presentation: **no** `CHANGELOG` data shape change, **no** schema/`APP_VERSION` logic change (a normal build bump applies when shipped).

## Verify (at `start`)

- `./build/check.sh` parses. Open a release with `updateSections` (e.g. a recent Atlas Ink entry): each section shows as a **header with level-1 bullets**, no heading bullet, no double indent.
- Highlights still renders as a simple bullet list; the Full Update List `<details>` still expands/collapses and shows "X sections · Y updates".
- Light/dark legible; mobile indentation clean.
