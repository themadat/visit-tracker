# WISH-053 — Multiple Named Basecamp Pads with Rich Text

Branch: `4-4-0-basecamps`. Target: 4.4.0 (theme: Basecamps). Planning only — no
APP_VERSION / CHANGELOG churn from this doc.

## Goal

Extend Basecamp from a single autosaving scratchpad into a small workspace of
named pads, each with light rich-text formatting and cross-pad search. Migrate
the existing scratchpad into the first pad without data loss, keep everything
local/offline, and keep Basecamp visually distinct from location notes.

## Current state (as of 4.3.0)

- Single dialog `#basecampDialog` (~820×860) opened from `#basecampBtn` and the
  universal `B` shortcut.
- One `<textarea id="basecampText" maxlength="20000">`.
- State shape: `state.basecamp = { text, updated }`; default in
  `defaultState()` ([index.html:18742](index.html:18742)); repair in
  `normalizeState()` ([index.html:19263](index.html:19263)).
- Save path: `handleBasecampInput()` debounces 250 ms then calls `save()`
  ([index.html:27320](index.html:27320)).
- Actions: Copy (`P`), Clear (`X`), Close (`Q`). Status + char count footer.
- Exports: MD, RTF, Text each append a single trailing "Basecamp" section
  ([index.html:27505](index.html:27505), [27571](index.html:27571),
  [27646](index.html:27646)).
- Help / FAQ / Shortcuts Reference all reference the single scratchpad.

## Target shape

### Data model

```js
state.basecamp = {
  pads: [
    {
      id,            // padXXXXXXXX
      name,          // string, ≤60 chars, deduped
      icon,          // SF-symbol key from BASECAMP_PAD_ICON_SET; always set
      html,          // sanitized rich-text HTML, ≤BASECAMP_PAD_HTML_MAX
      plainText,     // derived cache for search/exports/count, kept in sync on save
      linkedNotes,   // [{ noteId, regionCode }] — order preserved as added
      created,       // ISO
      updated        // ISO
    }
  ],
  activePadId,
  legacyMigrated: true  // set once after first-pad migration; never re-runs
};
```

**Icon vocabulary.** Define `BASECAMP_PAD_ICON_SET` as a dedicated constant
list — *not* the auto-discovered Location-Tag `__*_CIRCLE` pool. Basecamp
icons are planned to migrate to a square-based subset in a follow-up; pinning
this to its own constant lets that swap touch a single declaration without
hunting through the codebase.

For 4.4.0, seed `BASECAMP_PAD_ICON_SET` with the existing Basecamp glyph
(`__LONG_TEXT_PAGE_AND_PENCIL`) plus a small, conservative set already present
in the codebase (e.g. the page/pencil, document-on-document, tray, and
suitcase-style glyphs already used elsewhere) so the picker is non-empty in
4.4.0. Default pad icon: `BASECAMP_PAD_DEFAULT_ICON =
"__LONG_TEXT_PAGE_AND_PENCIL"`. Every new pad — including the legacy
migration pad — starts on this icon. Unknown keys repair to the default on
load. Treat the eventual square-icon set as a drop-in replacement of
`BASECAMP_PAD_ICON_SET` plus a one-time `normalizeState` repair pass; do not
build extra abstraction for it now.

**Linked notes.** Each entry in `linkedNotes` references an existing note
elsewhere in state (`{ noteId, regionCode }`); the layer (`us` vs `world`)
is resolved at render time via the existing `notesStoreForCode` /
`regionStoreForCode` helpers, so territories continue to resolve into the US
store on both maps. The pad body HTML never contains the link itself — the
block is rendered from `linkedNotes` below the editor.

Constants (new):

- `BASECAMP_PAD_MAX = 20` — max pads.
- `BASECAMP_PAD_NAME_MAX = 60`.
- `BASECAMP_PAD_HTML_MAX = 60_000` — keeps a single backup compact; covers
  generous rich text relative to today's 20 000 char plain cap.
- `BASECAMP_DEFAULT_PAD_NAME = "Basecamp"` — used for legacy migration only.

### Migration (in `normalizeState`)

If `input.basecamp.pads` is a non-empty array, normalize each pad: keep
known keys, clamp lengths, regenerate `plainText` if missing, repair
unknown/empty `icon` values to `BASECAMP_PAD_DEFAULT_ICON`, and reuse
`legacyMigrated` only when already set. Repair `linkedNotes` by filtering
out entries whose `noteId` is not present anywhere in `next.notes` /
`next.world.notes`, and dedupe by `noteId`. Stale links auto-drop here
(no struck-through ghosts).

Otherwise, look at the old `input.basecamp.text`:

- If non-empty, create one pad named "Basecamp" with `icon:
  BASECAMP_PAD_DEFAULT_ICON`, `linkedNotes: []`, and `html` produced by
  `legacyTextToHtml(text)` (escape, split on blank lines into `<p>`,
  newlines → `<br>`). Carry `updated`/`created` from the legacy `updated`
  if present.
- If empty, leave `pads: []` and set `activePadId: ""`. The UI shows an empty
  state and one-click "New Pad" CTA.

Linked-note repair runs *after* notes have been normalized so the index used
to validate `noteId`s is the final, post-migration set. Note deletion paths
elsewhere in the app do **not** need to walk Basecamp; the next load handles
it. (If a user deletes a note and immediately reopens the pad without
reloading, the render layer also filters unresolvable ids so the chip
disappears live.)

Set `legacyMigrated: true` once handled. Always preserve the
`usStateVisitMap.v1` schema — additive only; never drop unrelated keys.

JSON import: accept both old single-text shape and new multi-pad shape so
backups round-trip across versions.

### UI

Single `#basecampDialog`, same outer size (820×860, clamps unchanged).
Two-pane layout when ≥720 px wide; stacked when narrower.

```
┌─────────────────────────────────────────────────────────────┐
│ Basecamp                       [Copy] [Clear] [Close]       │
│ Autosaves as you type.                                      │
├──────────────────┬──────────────────────────────────────────┤
│ [Search pads…]   │ [icon] Pad name (inline editable)        │
│ + New Pad        │  ──────────────────────────────────────  │
│ • [📄] Packing(3)│  [B][I][H2][H3][•][1.][🔗 Link][⨯ fmt]   │
│ • [🛠]  Gear     │                                          │
│ • [🗺]  Trip 26 1│  contenteditable rich-text body…         │
│ • [📄] Basecamp  │                                          │
│                  │  ─── Linked notes ───────────────────────│
│                  │  • Yosemite NP — 2024-08-12  [open]      │
│                  │  • Crater Lake — 2023-09-04  [open]      │
│                  │  + Link a note…                          │
│                  │                                          │
│                  │  N chars • updated YYYY-MM-DD HH:MM       │
└──────────────────┴──────────────────────────────────────────┘
```

Pad list (`.basecamp-pad-list`):

- Each row: pad icon + name + match count when search active. Active pad uses
  the same highlighted-row treatment as the Legend's selected level.
- Inline rename on double-click or Rename action; commit on Enter, cancel on
  Escape, blur commits. A small icon button sits inline beside the rename
  field and opens a compact icon-picker popover (same vocabulary as Location
  Tags). The picker is reachable only via the inline rename row — no separate
  row-action entry — so icon changes flow through the same "I'm editing this
  pad" interaction.
- Per-row actions menu: Rename, Delete. Delete uses `requestConfirm`.
- Reorder by drag: the existing Legend drag plumbing
  (`renderLegend`/`moveLevel`) is the reference implementation; mirror its
  pointer handling, autoscroll, and keyboard fallback (`Alt+Up`/`Alt+Down`
  on a focused row) for accessibility. No Move Up/Down buttons in the row.
- "+ New Pad" creates a pad named "New Pad", "New Pad 2", … with
  `icon: BASECAMP_PAD_DEFAULT_ICON`, and selects it with the name field
  focused.

Editor (`.basecamp-pad-editor`):

- Toolbar with explicit click targets: Bold, Italic, H2, H3, Bulleted,
  Numbered, Link (URL), Clear format. **Toolbar buttons are not registered as
  Shortcut Mode targets** — formatting lives on OS shortcuts (Cmd/Ctrl+B,
  Cmd/Ctrl+I, Cmd/Ctrl+K) plus toolbar clicks. Shortcut Mode keys in the
  dialog header stay on Copy `P` / Clear `X` / Close `Q` / New Pad `N` /
  Link note `L` / `/` (focus pad search) so the global `B`-opens-Basecamp
  shortcut never collides with Bold. (The toolbar's Link button is a *URL*
  link — distinct from the "Link note" action that adds to the linked-notes
  block.)
- A single `<div contenteditable="true" class="basecamp-pad-body" role="textbox">`.
  Empty-state placeholder via `:empty::before { content: attr(data-placeholder); }`.
- Sanitize aggressively:
  - Allowed tags: `p, br, b, strong, i, em, u, h2, h3, ul, ol, li, a, blockquote, code, pre`.
  - Strip `style`, `class`, `id`, `on*`, `data-*` except where we add them.
  - Anchors: force `target="_blank"`, `rel="noopener noreferrer"`,
    accept `http(s):`/`mailto:` only.
  - Paste handler: prefer `text/html`, sanitize through `sanitizeBasecampHtml`,
    fallback to `text/plain` wrapped in `<p>`.
  - On every save: re-sanitize the live HTML, derive `plainText` via a hidden
    DOM scratch node (`innerText`), clamp.
- Implement formatting via the Selection / Range API with small helpers
  (`toggleInline("strong")`, `applyBlock("h2")`, `applyList("ul")`,
  `insertLink(url)`). Avoid `document.execCommand` — it's deprecated and its
  output (e.g. `<font>`, inline styles) breaks our sanitizer contract.
- Link insertion: tiny inline popover anchored under the toolbar Link button
  with a single URL input + Apply / Remove buttons; never a full `prompt()`.

### Linked notes block

A dedicated, render-only block sits at the bottom of the editor pane
(below the contenteditable body, above the count/status row). Layout:

- Section heading "Linked notes" (hidden when empty *and* the picker is
  closed; otherwise visible with a "+ Link a note" CTA).
- One row per `linkedNotes` entry, ordered by insertion. Each row shows:
  region/title (note's primary display label — reuse the existing Notes
  row label logic), formatted date, and a 40px icon button to open. Hover
  state reveals an Unlink (`X`) action; on touch the row exposes the same
  via a small overflow chevron.
- "+ Link a note" opens an inline picker (anchored under the row, similar
  in feel to the existing Suggested-Set popouts):
  - Search input filters across **all** notes (US + world stores) by
    title, region name, date, city, what, who, details — reusing
    `searchableNoteText` logic if present, otherwise a small local
    matcher that mirrors the Notes panel search behavior.
  - Results render as compact rows with the note's icon, region, title,
    and date. Already-linked notes appear dimmed and disabled.
  - **Click-to-insert one at a time**: clicking a result appends it to
    `linkedNotes`, clears the search input, and keeps the picker open so
    the user can immediately search for the next one. A small "Done"
    button (or pressing Escape / clicking outside) closes the picker.
  - Empty-search state shows the most recently edited notes as quick
    picks (cheap heuristic: top 8 by `updated` || `date`).
- Click a linked row → `openNoteDialog(noteId)` reusing the existing
  editor path. Closing the editor returns to the Basecamp dialog with
  the same active pad. Editing the note's region or deleting it
  invalidates the link on the next render; deletion drops the entry
  silently.
- The picker is opened from a "Link note" button placed in the linked-
  notes header row and from the Shortcut Mode key `L`. The picker is a
  Basecamp-internal popover; it does not register Notes-panel state.

### Cross-pad search

- Input above the pad list. Debounced 120 ms. Matches against pad `name` and
  `plainText` (case-insensitive). Linked-note targets are *not* indexed by
  pad search — those notes already live in the main Notes search.
- Pad list rows show match counts; rows without matches dim but stay
  clickable.
- When a pad is opened with active search, scroll to the first occurrence and
  wrap it in `<mark class="basecamp-search-hit">` ephemerally (re-rendered on
  any edit so the highlights never get persisted).
- Clearing search restores the full list and removes ephemeral marks.

### Status, count, autosave

- Status pill behavior unchanged ("Saving…" → "Saved"). Operates on the
  active pad.
- Footer count switches to `${activePad.plainText.length} chars • Updated
  ${relative(updated)}`. Aria-live polite as today.
- Autosave timer keyed on active pad id so switching pads mid-debounce
  flushes the previous pad before swapping.

### Header actions

- Copy: copies **active pad's plainText** by default (`P` shortcut). Small
  chevron next to Copy exposes "Copy all pads" (joined by `### <Pad>`-style
  headers + a blank line). Chevron uses the existing Suggested-Set popout
  pattern for visual consistency.
- Clear: now scoped — "Clear this pad's content" (does not delete the pad)
  with confirm. Keep `X` shortcut.
- Close: unchanged (`Q`).

### Visual distinctness

- Keep teal/Basecamp accent on toolbar buttons; pad list rows use a softer
  surface than location-note rows; editor body uses a slightly larger
  line-height and serif optional? — stick with `font: inherit` plus a 1.55
  line-height (current) so it still feels practical, not "marketing UI".
- Pad list rows mirror Legend-row scale and spacing so they read as part of
  the same design vocabulary.

## Hot files

- `index.html`:
  - Constants near current `BASECAMP_MAX_LENGTH` ([index.html:18538](index.html:18538)).
  - State defaults ([index.html:18742](index.html:18742)) and normalize
    ([index.html:19263](index.html:19263)).
  - Dialog markup ([index.html:14858](index.html:14858)).
  - CSS block ([index.html:6341](index.html:6341)).
  - Open/save/copy/clear functions ([index.html:27283](index.html:27283)+).
  - Universal shortcut `b` mapping ([index.html:28789](index.html:28789)).
  - Event bindings ([index.html:29104](index.html:29104)+).
  - Exports MD/RTF/Text ([index.html:27505](index.html:27505),
    [27571](index.html:27571), [27646](index.html:27646)).
  - Help/FAQ/Hints text ([index.html:15205](index.html:15205) area,
    ~17747 "What's New", ~17680 Shortcuts Reference, ~15378 hint copy).

## Exports

For MD, RTF, and Text, replace the single "Basecamp" trailing section with
one section per pad (preserve insertion order). Suppress the whole block
when every pad is empty.

- **Markdown** (`exportMarkdown`): emit `## Basecamp` then a `### <Pad Name>`
  per pad with body produced by `basecampHtmlToMarkdown(pad.html)` — a small
  converter that maps `strong/em/h2/h3/ul/ol/li/a/p` to MD equivalents. After
  the body, if `linkedNotes` is non-empty, emit a `**Linked notes**` line
  followed by `- <region> — <date> — <smart-convert-text>` per entry. A pad
  with both empty body *and* no links is omitted; a pad with links but no
  body still renders so the link list is preserved.
- **RTF** (`exportRichText`): inline subset of bold/italic/list using RTF
  control words. Implement `basecampHtmlToRtf(pad.html)` returning an RTF
  body fragment; emit `Basecamp` header + pad-name lines + linked-note rows.
- **Plain Text** (`exportPlainText`): per pad, `Basecamp` header then
  `<Pad Name>` followed by `pad.plainText`, then `Linked notes:` and one
  line per entry. Blank line between pads.

JSON export already encompasses the full state object — no extra work
beyond the new shape being natively serializable.

## Shortcuts & keyboard

- Universal: `B` continues to open Basecamp (unchanged), or trigger
  `notesPanelBackBtn` when drilled in.
- Shortcut Mode buttons in the dialog header (Copy `P`, Clear `X`,
  Close `Q`) unchanged. Add `N` for "+ New Pad", `L` for "+ Link a note"
  (opens the linked-notes picker), and `/` to focus pad search.
- Inside the editor: Cmd/Ctrl+B (Bold), Cmd/Ctrl+I (Italic), Cmd/Ctrl+K
  (Link). Bind locally on the contenteditable; don't pollute the global
  shortcut handler.
- Shortcuts Reference (`#keyboardShortcutsReference`,
  ~[index.html:15378](index.html:15378)): add a Basecamp row group covering
  the new dialog keys (`N`, `L`, `/`) and the editor shortcuts (Cmd/Ctrl+B,
  Cmd/Ctrl+I, Cmd/Ctrl+K) plus the `Alt+Up`/`Alt+Down` pad-reorder fallback.

## Settings / Help / What's New / FAQ

- **Help Center** Basecamp entry (~[index.html:15205](index.html:15205)):
  describe pads, rich-text toolbar, search, exports. Keep the "what is
  Basecamp" framing.
- **FAQ**: add a Q on "What if I had stuff in the old single Basecamp?"
  and "Are pads encrypted/cloud?" (answer: local-only, in the same backup).
- **Hints**: add `data-hint` text on `+ New Pad` and on the search input
  for first-run discoverability; dismissable like other hints.
- **What's New / release notice**: handled in `prep`/`ship`, not now.

## Roadmap

- WISH-053 `targetVersion` becomes `"4.4.0"` when `start` opens the line.
- No new follow-up wishes from planning yet. After implementation we may
  seed a smaller wish for image paste / per-pad emoji icon, but those are
  explicitly out of scope here.

## Invariants & risks

- `usStateVisitMap.v1` schema preserved (additive).
- Old `basecamp.text` migrated exactly once; the legacy field is dropped
  from `next.basecamp` afterward (so reloading does not double-migrate).
- Backups produced by 4.3.x must round-trip on 4.4.0 (one-way migration on
  load is fine — re-saving emits the new shape).
- Active pad id must always reference a real pad; on load, fall back to
  `pads[0].id` if missing or stale; on delete of the active pad, select the
  neighbor (next, else previous, else `""`).
- Pad name uniqueness is *not* enforced — show duplicates as-is. We only
  trim and clamp.
- `linkedNotes` stores raw `noteId`s; layer/region is resolved at render.
  Stale ids are pruned by `normalizeState` and also filtered live during
  render so a deletion during a session does not leave a phantom row.
- `BASECAMP_PAD_ICON_SET` is the only declaration referencing the active
  Basecamp icon vocabulary. The future swap to square-based icons replaces
  this constant and reuses the same picker; no other code path should hard-
  code Basecamp icon keys.
- Sanitizer is the security boundary: paste from a malicious source must
  not retain `<script>`, event handlers, `javascript:` URLs, or styles. All
  HTML stored in state must already be sanitized; the editor renders
  sanitized HTML and re-sanitizes on every save.
- contenteditable quirks across browsers (Safari especially): test that
  Enter produces `<p>`/`<div>` predictably; if Safari inserts a `<div>`,
  the sanitizer should normalize bare `<div>` to `<p>`.
- execCommand is intentionally avoided; using Selection API helpers
  instead. Small risk of more code, but predictable sanitizer-friendly
  output.
- Performance: 20 pads × 60 KB HTML ≈ 1.2 MB cap on basecamp state — still
  well inside localStorage budgets given the rest of the state. Search
  uses cached `plainText`, not live DOM.

## Implementation phases

1. **Schema + migration**
   - Add constants, extend `defaultState`, rewrite `next.basecamp` block
     in `normalizeState` to handle both shapes.
   - Verify JSON import of an old backup produces a single migrated pad.
2. **Sanitizer + plain-text derivation helpers**
   - `sanitizeBasecampHtml(input)`, `basecampPlainText(html)`,
     `legacyTextToHtml(text)`. Unit-testable in isolation via `jsc`.
3. **Dialog layout & pad list**
   - New two-pane structure, list rendering with pad icons, active highlight,
     rename, drag-reorder (mirrors `moveLevel`) with `Alt+Up`/`Alt+Down`
     keyboard fallback, delete with confirm, "+ New Pad".
   - Inline icon-picker popover beside the rename field.
   - Open/close behavior preserved; status/count adapted to active pad.
4. **Rich-text editor + toolbar**
   - contenteditable wiring, selection helpers, toolbar buttons, link
     popover, paste handler, keyboard shortcuts.
   - Autosave debounce per active pad.
5. **Linked notes block**
   - Render-only block under the editor, "+ Link a note" inline picker with
     debounced cross-store search, click-to-insert, dimmed-already-linked
     state, unlink action, click-row opens `openNoteDialog`. Live render
     filter for stale ids; `normalizeState` repair for stored ids.
6. **Search**
   - Search input, debounced filter, match counts, ephemeral highlights.
7. **Exports**
   - `basecampHtmlToMarkdown` / `basecampHtmlToRtf`; update MD/RTF/Text
     export sites; Copy chevron with "this pad" / "all pads"; include
     linked-note rows per pad.
8. **Surfaces**
   - Help Center entry, FAQ Q, hint copy, Shortcuts Reference rows,
     placeholder text.
9. **Cleanup / verify**
   - Smoke through the test plan; tidy CSS; ensure no dead references to
     the old single `basecampText` textarea.

(`prep` covers What's New / release notice / README / handoff polish.)

## Test plan

- **Schema**: load app with legacy `usStateVisitMap.v1` containing
  `basecamp: { text: "abc\n\ndef", updated: "…" }` → exactly one pad named
  "Basecamp" containing two `<p>` blocks; `legacyMigrated: true`; reload
  does not duplicate.
- Load with empty legacy basecamp → pads array empty, "+ New Pad" CTA.
- Load with new shape already present → preserved unchanged.
- JSON import of an old backup → migrated; import of a new backup →
  round-trips.
- **Pad CRUD**: create up to `BASECAMP_PAD_MAX`; cap blocks further adds
  with a status message. Rename inline; change icon via inline popover (and
  verify unknown icon keys repair to the default on reload); drag to reorder;
  `Alt+Up`/`Alt+Down` reorder keyboard fallback; Delete with confirm;
  deleting the active pad selects neighbor.
- **Editor**: type text; toggle Bold/Italic via toolbar + Cmd/Ctrl+B/I;
  apply H2/H3; toggle bullet + numbered list; insert and edit a link;
  Clear formatting strips inline marks but preserves text.
- **Sanitizer**: paste rich HTML from another page (with `<script>`,
  inline styles, event handlers, `javascript:` URLs) → none survive.
- **Linked notes**:
  - Open the picker; type a query; click a result → row appears in the
    Linked notes block, picker clears its input, stays open, the just-
    linked row dims in results.
  - Empty search shows recent-by-updated quick picks.
  - Click an existing linked row → note editor opens; closing it returns
    to Basecamp on the same pad.
  - Delete a linked target note from the editor → the linked-notes row
    disappears on the next Basecamp render; reload also drops it.
  - Unlink action removes the row without touching the target note.
  - Backup containing `linkedNotes` with one valid and one invalid id →
    after `normalizeState`, only the valid one remains.
  - Notes on either US or world store are linkable; world-store
    territories continue to resolve into the US store on both maps.
- **Search**: query matches across pads; counts correct; ephemeral
  highlight appears, clears on edit / on search clear; never persists.
- **Autosave**: edit pad A, switch to pad B before the debounce — pad A
  flushed first; both pads land in state.
- **Status flash**: Saving… → Saved, fades back to default.
- **Copy**: default copies active pad's plainText; chevron's "Copy all pads"
  joins non-empty pads with named headers; empty pad → "Nothing to copy yet"
  flash.
- **Clear**: only clears active pad body (does not delete the pad).
- **Exports**:
  - MD has `## Basecamp` then `### <Pad>` per non-empty pad, with a
    `**Linked notes**` list when present.
  - RTF preserves bold/italic/lists in TextEdit (macOS) open test;
    linked-note rows appear under each pad.
  - Plain Text has header lines, `plainText`-only bodies, and a
    `Linked notes:` block per pad when present.
  - All export types omit the Basecamp block when every pad has neither
    body content nor links.
- **Universal `B`**: still opens the dialog. Drilled-into Notes location
  still maps `B` to Back.
- **Shortcut Mode**: `P/X/Q/N/L//` work inside the dialog.
- **Mobile/narrow**: ≤720 px the layout stacks; pad list collapses to a
  scrollable strip; editor remains usable.
- **Dark mode**: pad list contrast, toolbar buttons, search highlight all
  legible.
- **Persistence**: edits survive reload; `state.basecamp.pads[*].updated`
  advances; `legacyMigrated` does not flip back.

## Decisions (locked)

1. **Copy default**: copies the active pad's plain text. Chevron next to
   Copy offers "Copy all pads".
2. **Bold inside the editor**: Cmd/Ctrl+B only; toolbar buttons are not
   Shortcut Mode targets so the global `B`-opens-Basecamp shortcut is safe.
3. **Per-pad icon**: each pad has an `icon` field drawn from a dedicated
   `BASECAMP_PAD_ICON_SET` constant — *not* the auto-discovered Location
   Tag vocabulary. 4.4.0 seeds the set from existing glyphs already in the
   codebase (default: `__LONG_TEXT_PAGE_AND_PENCIL`). A follow-up release
   will swap that constant to a square-based icon subset; the swap is a
   single-declaration change plus a `normalizeState` repair pass. Inline
   icon picker lives beside the rename field; no row-action entry.
4. **Image paste**: stripped by the sanitizer; Basecamp stays text-only.
5. **Reorder**: drag to reorder, mirroring the Legend's drag handler, with
   `Alt+Up`/`Alt+Down` as an accessibility / keyboard fallback. No Move
   Up/Down buttons.
6. **Pinning**: out of scope; manual drag order is authoritative.
7. **Linked notes**: pads can reference existing notes via a render-only
   "Linked notes" block at the bottom of the editor. Stored as
   `linkedNotes: [{ noteId, regionCode }]` on the pad. Picker is an inline
   click-to-insert search (one at a time); already-linked rows dim in
   results. Clicking a linked row opens `openNoteDialog(noteId)`. Stale
   references (deleted notes) auto-drop in `normalizeState` and during
   live render — no struck-through ghosts. Linked-note targets are *not*
   indexed by Basecamp's cross-pad search.
