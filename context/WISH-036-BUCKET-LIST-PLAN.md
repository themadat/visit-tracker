# WISH-036 — Wayfinder (4.1.0)

> **Naming note:** the feature was designed under the working name **"Bucket
> List"** and renamed to **"Wayfinder"** before release. Internal symbols
> (`isBucketList`, `bucketListView`, `bucketListLevelId`, CSS `.is-bucket-list`
> / `data-bucket-mode`, etc.) keep the original name for localStorage schema
> preservation. All user-facing strings throughout the rest of this document
> describe the shipped feature — read each "Bucket List" as "Wayfinder" when
> reading from a 4.1.0+ perspective.

Target release: **Trail Log 4.1.0 "Wayfinder"**.
CTA: **"Start Planning!"** (working).
Branch: `4-1-0-Bucket-List`.

## Thesis

> "I don't think I need a whole new mode — I think I can reuse current
> features and just give the user a quick switch setup."

Adopted. A bucket-list item is just a **note tied to whichever legend level
the user has marked as their Bucket List**. The work is a thin **highlight
toggle** layered over the existing legend / notes / map systems — not a
parallel data model, not a second app mode.

No new data store. No new map layer. Filters keep working exactly as they
do today.

## Core idea: Bucket List is a *level role*

Any legend level can carry a `isBucketList: true` flag, with these rules:

1. **Only one level at a time** can be the Bucket List level. Flagging a
   second level un-flags the first.
2. The Bucket List level **must be excluded from stats**
   (`countsTowardStats: false`). If the user tries to flag a stats-counting
   level, the UI rejects it with an inline explanation:
   *"Bucket List levels need to be excluded from stats. Untick 'Counts
   toward stats' on this level first, or pick a different level."*
3. **Default seeding**: on first launch after this update, if no level has
   `isBucketList: true`, the built-in `want-to-visit` level is flagged
   automatically and its `definition` is changed to **"Bucket List"** so
   it reads that way in the legend.
4. **Custom names allowed**: the user can rename the level (e.g.
   "Dream Trip", "Someday") — the role flag is what matters, not the name.
5. **Activation guard**: if the user toggles Bucket List Mode on but no
   level carries the role *and* no excluded-from-stats level exists to
   auto-seed onto, surface a clear error:
   *"Add an excluded-from-stats legend level to use as your Bucket List,
   then try again."* (Link to legend editor inside the toast/banner.)

This makes "Bucket List" a property of the user's legend, not a hardcoded
ID — which keeps the door open for renaming, theming, and per-user vocab.

## What "Bucket List Mode" actually does

When **on**:

1. The map's level filter is **scoped to the Bucket List level** and
   **Match Notes is turned on**, so the map and Notes list focus on
   bucket-list places. The prior filter + Match Notes state is
   snapshotted first.
2. The Bucket List level is **highlighted** in the legend (orange accent
   ring / glow on the swatch).
3. On the map, regions and pins at the Bucket List level get an orange
   emphasis (halo on pins, accent outline on regions).
4. In the Notes panel, rows whose `levelId` matches the Bucket List level
   get an orange accent strip.
5. The orange **"Bucket List" pill** appears under the map name inside the
   map-switch button area (see UI surface #3).
6. **Quick Add defaults to the Bucket List level** for new notes (instead
   of the user's previous default), so "add to my bucket list" is one
   click + a region tap.

When **off**:

1. All highlights vanish.
2. The level filter and Match Notes state are restored from the
   snapshot taken at activation.
3. Quick Add returns to its prior default level.

**Filters still work normally on top of the mode.** Activation only
sets a starting point (level filter = Bucket List, Match Notes on); the
user can layer or change icon-tag filters, search, dates, and even add
additional level filters back in. Anything they do during the mode is
**not** preserved on deactivation — restore is from the activation
snapshot.

## Reused pieces (no new code)

| Surface | Reuse |
| --- | --- |
| Storage | `state.notes` / `state.world.notes` — bucket items are just notes |
| Levels | Existing `levels[]` array + legend editor; only the role flag is new |
| Filtering | Same pills/controls; mode just sets a starting point |
| Map scoping | Existing Match Notes — mode turns it on at activation |
| Editing | Existing note editor; Quick Add already supports any level |
| Pins | Existing pin renderer; we only layer an extra halo class |
| Exports | MD/RTF/Text/JSON already include all levels |

## New, small surfaces

1. **Level-role config (Legend editor)**
   - Each level row in the legend editor gains a small "Bucket List"
     checkbox/toggle.
   - Checking it on level A automatically unchecks it on whatever level
     previously had it.
   - The toggle is disabled when the level is set to count toward stats
     (hover/tap shows the inline error from §Core idea rule 2).
   - When a level is flagged, the legend swatch shows a tiny orange
     "BL" badge (or a small marker icon) so the role is visible at a
     glance even when the mode is off.

2. **Quick-switch button (two spots, identical behavior)**
   - **Map header**: immediately to the right of `#mapMatchNotesBtn`
     ("Match Notes" / note-filter button).
   - **Notes header**: immediately to the right of `#copyNotesTextBtn`
     ("Copy" button).
   - Pressing either flips Bucket List Mode for both surfaces and the
     status pill.
   - Label: "Bucket List" with a small icon (pick from existing
     `__*_CIRCLE` constants; no new SVGs).
   - Keyboard shortcut: `B` (verify no collision before wiring).
   - `aria-pressed` reflects state.

3. **Status pill — orange — inside the map-switch button**
   - When Bucket List Mode is on, a small orange pill reading
     **"Bucket List"** renders **inside the map-switch button, under the
     map name** (so it sits below "US Map" or "World Map" inside the
     same clickable area).
   - The pill itself is non-interactive (the map-switch button still
     switches maps); deactivation happens via the toggle buttons in
     surface #2.
   - Color: orange to match the highlight accent.
   - Pill disappears the instant the mode is off.

4. **"Mark Visited" promote action**
   - On any note whose level is the current Bucket List level, a small
     inline action: outline-circle → filled-check icon.
   - Behavior: open the note editor with `levelId` swapped to the user's
     preferred "visited" level (default: `"visited"`) and `date`
     defaulted to today (only if blank). User confirms / tweaks / saves.
     Cancel leaves the original untouched.
   - Why open the editor rather than auto-flip silently? Nudges the user
     to fill in `what` / `who` / actual date — the data that matters
     once a plan becomes a visit.

5. **Empty-state + subtitle copy (light touch)**
   - When the mode is on **and** the Notes list (after current filters)
     happens to be empty of Bucket List notes, show a small inline note:
     *"No bucket-list places yet — add one from any location's Quick Add."*
   - Otherwise, copy stays as-is. We don't reframe the whole panel; the
     mode is a highlight, not a takeover.

6. **Exports (small additions)**
   - MD / RTF / Plain Text: add a "Bucket List" section that re-lists
     notes whose `levelId` matches the user's flagged Bucket List level,
     grouped by region.
   - JSON: no change (data already round-trips by level + the new role
     flag).
   - Section is hidden if empty so untouched users don't see noise.

## State changes (minimal)

```js
// Per-level (existing shape) gains one flag:
levels: [
  { id, name, definition, color, countsTowardStats, isBucketList /* NEW */ }
]

// Settings gains the mode toggle + the activation snapshot:
settings: {
  // existing fields…
  bucketListView: false,         // user-visible toggle; PERSISTS across reloads
  bucketListFilterSnapshot: null // { levelFilter: [...], matchNotes: bool,
                                  //   quickAddLevelId: string } — captured at toggle-on
}
```

- `defaultState()` seeds `isBucketList: false` on each level and
  `bucketListView: false`, `bucketListMapFilterSaved: null` on settings.
- `normalizeState()`:
  - Defaults `isBucketList: false` on any level missing it.
  - Enforces "at most one" — if multiple levels somehow carry the flag,
    keep the first and clear the rest.
  - Enforces "must be excluded" — if a stats-counting level carries the
    flag, clear it.
  - **Seed pass**: if no level carries the flag and a `want-to-visit`
    level exists, set its `isBucketList: true` and (only if its
    `definition` still matches the default "Planned — excluded from
    stats") change `definition` to "Bucket List". Don't overwrite a
    custom definition.
  - Defaults `bucketListView: false`, `bucketListFilterSnapshot: null`
    if missing.
- No migration logic beyond the above; the seed pass is idempotent.
- **Persistence**: `bucketListView` is sticky — if the user closes the
  tab with the mode on, it reopens on. The orange pill is the guardrail.

## UI/UX guardrails

- The mode is **non-destructive**: activation snapshots level filter +
  Match Notes state, then sets a focused starting point. Deactivation
  always restores the snapshot — the user can't lose prior filters by
  flipping the toggle.
- Bucket List Mode **does not** change the active map layer (US / World).
  Whichever map the user is on, the highlight applies to that layer.
- Quick Add **default** changes while the mode is on, but the user can
  still pick any level from the Quick Add picker as usual.
- Selected-location detail still ignores main-list filters (existing
  invariant). The mode adds visual emphasis on bucket-list notes in
  that view but does not change which notes are shown.
- The legend editor is the single source of truth for which level is the
  Bucket List level — there is no separate config screen.

## Out of scope (defer / non-goals)

- A separate "bucket-list-only" data store.
- A second map layer or map mode.
- Drag-to-reorder bucket list (use existing sort options).
- Priority/ranking on bucket items (revisit if requested).
- Calendar integration / trip planning.
- Drive-radius interactions (own ticket: WISH-010).
- Multiple simultaneous Bucket List levels.

## Phasing

**Phase 1 — Level role + legend UI + seed**

- Add `isBucketList` to level shape with normalize + seed pass (Want to
  Visit → "Bucket List" definition by default; idempotent).
- Add the Bucket List toggle to the legend editor (with the
  excluded-from-stats guard + inline error message).
- Add the small "BL" badge on the flagged level's legend swatch.
- Verify: only one level can hold the flag; stats-counting levels
  reject it; existing saves migrate cleanly with `want-to-visit`
  auto-flagged.

**Phase 2 — Quick-switch toggles + filter scoping + status pill**

- Add `settings.bucketListView` + `settings.bucketListFilterSnapshot`.
- Add mirrored toggles: map header (next to `#mapMatchNotesBtn`) and
  Notes header (next to `#copyNotesTextBtn`). Press either → both
  reflect state.
- On activation: snapshot `{ levelFilter, matchNotes, quickAddLevelId }`,
  then set level filter to the Bucket List level only, turn Match Notes
  on, set Quick Add default to the Bucket List level.
- On deactivation: restore exactly from the snapshot, clear it.
- Render the orange "Bucket List" pill inside the map-switch button,
  under the map name.
- Activation guard: if no Bucket List level can be resolved, surface
  the error toast and do not flip the state.
- Verify: persistence across reload; US + World both behave; restore
  matches snapshot exactly; user can layer filters during the mode;
  pill disappears the moment mode is off.

**Phase 3 — Highlight rendering**

- Legend: orange accent ring on Bucket List swatch while mode is on.
- Map: orange halo on Bucket List pins; subtle outline on regions whose
  current level is the Bucket List level.
- Notes list: orange accent strip on rows whose `levelId` matches.
- Quick Add: while mode is on, default new-note level to the Bucket
  List level.
- Verify: highlight scopes correctly when the user changes which level
  is flagged; no visual leak when mode is off.

**Phase 4 — Promote action + exports + polish**

- Per-row "Mark Visited" action — opens editor pre-filled with
  `levelId: "visited"` (or the first stats-counting level if "visited"
  is gone) and `date: today` (if blank).
- Add Bucket List section to MD / RTF / Plain Text exports (omit if
  empty).
- Add a small "Bucket List" hint in Help Center.
- Final pass: shortcut, aria, mobile layout.

**Phase 5 — Cut 4.1.0 "Bucket List"**

- Final theme name: **"Bucket List"**. CTA: **"Start Planning!"**.
- Collapse build entries into the 4.1.0 release entry.
- Remove WISH-036 from active roadmap (move to completed list).

## Verification checklist (carry forward into builds)

- [ ] Exactly one level can carry `isBucketList: true` at a time.
- [ ] Stats-counting levels cannot be flagged; UI explains why.
- [ ] First load after upgrade auto-flags `want-to-visit` and renames
      its definition to "Bucket List" (only when definition is still
      the default).
- [ ] Renaming the Bucket List level keeps the flag; mode still works.
- [ ] Deleting the Bucket List level clears `settings.bucketListView`
      and shows the seed-error on next toggle attempt.
- [ ] Bucket List Mode persists across reload.
- [ ] Status pill is visible inside the map-switch button (orange,
      under the map name) whenever the mode is on; vanishes the moment
      it's off.
- [ ] Notes-header toggle and map-header toggle stay in sync regardless
      of which one is pressed.
- [ ] Mode works on US map and World map.
- [ ] Activation snapshots `{ levelFilter, matchNotes, quickAddLevelId }`
      and deactivation restores them exactly.
- [ ] During the mode, the user can change level filters, Match Notes,
      icon tags, search, dates, and Quick Add level freely; any of those
      changes are discarded on deactivation (restore from snapshot).
- [ ] Highlights appear on legend, map, and Notes list — and disappear
      cleanly when mode flips off.
- [ ] Quick Add defaults to the Bucket List level while mode is on,
      previous default while mode is off.
- [ ] "Mark Visited" promote action opens editor with pre-fills; cancel
      preserves the bucket-list note.
- [ ] Existing JSON backups (pre-4.1.0) load with `bucketListView:
      false` and `isBucketList: false` everywhere except the seeded
      `want-to-visit`.
- [ ] Exports include Bucket List section when items exist; section is
      absent when none.

## Locked decisions

1. **Level role, not hardcoded ID**: any excluded-from-stats level can
   be flagged `isBucketList`. Default seed: `want-to-visit`, with
   `definition` set to "Bucket List".
2. **Mode applies a filter scope, with snapshot/restore**: on activation
   the level filter is set to the Bucket List level and Match Notes
   turns on. Prior `{ levelFilter, matchNotes, quickAddLevelId }` is
   snapshotted and restored on deactivation. The user can layer or
   modify any filter during the mode — those changes are discarded on
   restore.
3. **Quick Add defaults to the Bucket List level while mode is on.**
4. **Toggle placement**: map header next to `#mapMatchNotesBtn`; Notes
   header next to `#copyNotesTextBtn`.
5. **Status pill**: orange, rendered inside the map-switch button
   under the map name. Non-interactive (deactivate via toggles).
6. **Persistence**: sticky across reload; the pill is the guardrail.
7. **Error path**: if no Bucket List level exists and none can be
   seeded, show a clear toast explaining how to fix it.
8. **Theme + CTA**: 4.1.0 "Bucket List", CTA "Start Planning!"
   (alternates if we want to swap: "Start the List!", "Drop a Wish!",
   "Chart the Course!").
