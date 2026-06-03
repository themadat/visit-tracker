# WISH-004 4.3.0: Suggested Sets + National Parks

Status: active implementation for 4.3.0
Ticket: WISH-004
Working title: Suggested Sets + National Parks

## Summary

Reframe WISH-004 from a one-off National Park overlay into **Suggested Sets**,
with **National Parks** as the first bundled set. Suggested Sets are curated
place packs that can be previewed, annotated, prioritized, and batch-added into
Wayfinder as normal notes. They draw their own set-aware markers and labels,
but they do not change state progress unless the user manually edits state
levels.

National Parks v1 includes all official National Park-designated units,
including Alaska, Hawaii, and territories. No runtime NPS API calls, no API
keys, and no park boundary geometry.

## Key Changes

- Add bundled set data:
  - `SUGGESTED_SETS`, starting with `national-parks`.
  - Each item has stable id/code, name, label abbreviation, primary state,
    state list, coordinates, URL, and default note template.
  - National Parks abbreviation labels use official uppercase NPS codes like
    `ACAD`, `ZION`, `GRCA`.
- Add lightweight note metadata:
  - Normal notes may carry `sourceSetId`, `sourceItemId`, and managed set
    fields.
  - Set-created notes remain normal notes in Notes, exports, filters, and
    Wayfinder.
  - Set metadata is used for duplicate checks, refreshes, set labels, marker
    styling, and "from this set" disclaimers.
  - Normalize metadata in saved/imported notes and drop unknown set/item ids.
- Add optional note priority:
  - Any note can have `priority` from `1` to `5` or blank.
  - Show priority as a compact badge on set markers and note rows where useful.
  - Add priority to note search/export text and keep it sortable/filterable for
    set views.
- Add Suggested Sets UI:
  - Add a Sets entrypoint next to the US/World map switch and another access
    point from Wayfinder; both open the same Sets drawer/sheet.
  - Sets drawer shows active sets, bundled available sets, active set controls,
    and preview/add/remove actions.
  - Add Set opens an editable preview table with `Include`, `Priority`, and
    `Note` columns before creating notes.
  - Batch add creates missing notes and refreshes existing set notes using
    managed fields only.
  - After adding, enable the chosen Location Tag, turn the set overlay on, and
    enter Wayfinder.
- Add attach/update flows:
  - From a set item, allow "Attach existing note."
  - From the note editor, allow "Add to active set" when a set item is selected.
  - Attaching sets source metadata, coordinates, chosen icon/tag, Where/geocode
    basics, and set marker fields while preserving user level, date, details,
    what/who, and non-set tags unless missing.
- Add set marker and label behavior:
  - Set markers use the set's chosen icon/logo with border/status color from
    the linked note's level.
  - Adding set notes does **not** apply the Wayfinder level to entire states.
  - Visited notes stay linked to the set; marker color changes with the note
    level.
  - Removing a set deletes only untouched generated Wayfinder notes; edited or
    visited notes stay as normal linked/detached notes per confirmation copy.
  - Label UI is a dropdown: choose an icon/set marker family, then choose label
    mode `Off`, `Abbr`, `Name`, or `Both`.
  - Default label mode for National Parks is `Off`.
- Add exports:
  - JSON includes normalized note metadata and priority naturally.
  - Markdown/RTF/Text add Suggested Sets sections when linked set notes exist.
  - Wayfinder exports should group set-created notes under their set name while
    preserving existing Wayfinder behavior.

## National Parks Snapshot

| Park | Code |
|---|---|
| Acadia | ACAD |
| American Samoa | NPSA |
| Arches | ARCH |
| Badlands | BADL |
| Big Bend | BIBE |
| Biscayne | BISC |
| Black Canyon of the Gunnison | BLCA |
| Bryce Canyon | BRCA |
| Canyonlands | CANY |
| Capitol Reef | CARE |
| Carlsbad Caverns | CAVE |
| Channel Islands | CHIS |
| Congaree | CONG |
| Crater Lake | CRLA |
| Cuyahoga Valley | CUVA |
| Death Valley | DEVA |
| Denali | DENA |
| Dry Tortugas | DRTO |
| Everglades | EVER |
| Gates of the Arctic | GAAR |
| Gateway Arch | JEFF |
| Glacier | GLAC |
| Glacier Bay | GLBA |
| Grand Canyon | GRCA |
| Grand Teton | GRTE |
| Great Basin | GRBA |
| Great Sand Dunes | GRSA |
| Great Smoky Mountains | GRSM |
| Guadalupe Mountains | GUMO |
| Haleakalā | HALE |
| Hawaiʻi Volcanoes | HAVO |
| Hot Springs | HOSP |
| Indiana Dunes | INDU |
| Isle Royale | ISRO |
| Joshua Tree | JOTR |
| Katmai | KATM |
| Kenai Fjords | KEFJ |
| Kings Canyon | KICA |
| Kobuk Valley | KOVA |
| Lake Clark | LACL |
| Lassen Volcanic | LAVO |
| Mammoth Cave | MACA |
| Mesa Verde | MEVE |
| Mount Rainier | MORA |
| New River Gorge | NERI |
| North Cascades | NOCA |
| Olympic | OLYM |
| Petrified Forest | PEFO |
| Pinnacles | PINN |
| Redwood | REDW |
| Rocky Mountain | ROMO |
| Saguaro | SAGU |
| Sequoia | SEQU |
| Shenandoah | SHEN |
| Theodore Roosevelt | THRO |
| Virgin Islands | VIIS |
| Voyageurs | VOYA |
| White Sands | WHSA |
| Wind Cave | WICA |
| Wrangell–St. Elias | WRST |
| Yellowstone | YELL |
| Yosemite | YOSE |
| Zion | ZION |

## Test Plan

- New map defaults: Sets overlay off, set labels off, no state recoloring.
- Add National Parks set through preview; confirm one Wayfinder note per
  included park.
- Use preview priorities and notes; confirm priority badges and note details
  persist.
- Re-run Add/Refresh Set; confirm managed fields update and user-entered fields
  are preserved.
- Attach an existing note from the set drawer and from the note editor.
- Mark a set-created Wayfinder note visited; confirm it stays linked and marker
  color changes.
- Remove the set; confirm untouched generated notes are removed and
  edited/visited notes are preserved.
- Verify label dropdown modes: Off, Abbr, Name, Both.
- Verify priority search/filter/sort/export behavior.
- Verify JSON export/import round-trips set metadata and priority.
- Smoke US/World switching, normal note pins, Wayfinder, Rangefinder, and
  existing exports.

## Assumptions

- Suggested Sets are implemented inside the single-file app with no runtime
  dependencies.
- National Park data is a static bundled snapshot sourced from official NPS data
  outside runtime.
- Priority is a note field, not a Location Tag.
- Set identity is metadata on notes, not inferred from text.
- Set markers are visually separate from state progress and should not recolor
  states automatically.
- The current WISH-004 plan doc should be replaced with this revised Suggested
  Sets plan when implementation/editing is allowed.
