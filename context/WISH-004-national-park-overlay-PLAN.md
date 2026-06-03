# WISH-004 4.3.0: Waypoint Packs

Status: active implementation for 4.3.0
Ticket: WISH-004
Working title: Waypoint Packs

## Summary

Reframe WISH-004 from a one-off National Park overlay into **Waypoint Packs**,
a Wayfinder sub-feature for curated place packs. National Parks and National
Monuments are the first bundled packs. Packs can be previewed, annotated,
prioritized, attached to existing notes, and batch-added into Wayfinder as
normal notes. They draw their own pack-aware markers and labels, but they do not
change state progress unless the user manually edits state levels.

National Parks v1 includes all official National Park-designated units,
including Alaska, Hawaii, and territories. No runtime NPS API calls, no API
keys, and no park boundary geometry.

National Monuments v1 includes a static snapshot from Wikipedia's
`List of national monuments of the United States`, with date established and
description text prefilled into note details. No runtime Wikipedia calls.

## Key Changes

- Add bundled pack data:
  - `SUGGESTED_SETS`, starting with `national-parks` and `national-monuments`.
  - Each item has stable id/code, name, label abbreviation, primary state,
    state list, coordinates, URL, and default note template.
  - National Parks abbreviation labels use official uppercase NPS codes like
    `ACAD`, `ZION`, `GRCA`.
  - National Monuments labels use generated uppercase codes and link to the
    corresponding Wikipedia page.
- Add lightweight note metadata:
  - Normal notes may carry `sourceSetId`, `sourceItemId`, and managed pack
    fields. Internal schema names keep `set` for compatibility.
  - Pack-created notes remain normal notes in Notes, exports, filters, and
    Wayfinder.
  - Pack metadata is used for duplicate checks, refreshes, labels, marker
    styling, and pack-source disclaimers.
  - Normalize metadata in saved/imported notes and drop unknown pack/item ids.
- Add optional note priority:
  - Any note can have `priority` from `1` to `5` or blank.
  - Show priority as a compact badge on pack markers and note rows where useful.
  - Add priority to note search/export text and keep it sortable/filterable for
    pack views.
- Add Waypoint Packs UI:
  - Packs is a Wayfinder sub-feature; the Packs button appears only while
    Wayfinder is active and uses `__CIRCLE_BADGE_PLUS`.
  - The button opens an inset panel over Notes, not a modal, so the map remains
    visible and interactive.
  - Panel shows Available Packs, selected-pack progress, visual icon choices,
    overlay toggle, label mode buttons, add/refresh, remove, filter, and sort.
  - Add/Refresh uses editable preview cards with `Include`, `Priority`, and
    `Note` fields before creating notes.
  - Batch add creates missing notes and refreshes existing pack notes using
    managed fields only.
  - After adding, enable the chosen Location Tag, turn the pack overlay on, and
    enter Wayfinder.
- Add attach/update flows:
  - From a pack item, allow "Attach existing note."
  - From the note editor, allow "Add to active pack" when a pack item is
    selected.
  - Attaching sets source metadata, coordinates, chosen icon/tag, Where/geocode
    basics, and pack marker fields while preserving user level, date, details,
    what/who, and non-pack tags unless missing.
- Add pack marker and label behavior:
  - Pack markers use the pack's chosen icon/logo with Wayfinder teal overlay
    styling.
  - Priority markers use a 1-5 green, yellow-green, yellow, yellow-orange,
    orange color scale.
  - Adding pack notes does **not** apply the Wayfinder level to entire states.
  - Visited notes stay linked to the pack.
  - Removing a pack deletes only untouched generated Wayfinder notes; edited or
    visited notes stay as normal linked/detached notes per confirmation copy.
  - Overlay uses `__SQUARE_3_LAYERS_3D` when off and
    `__SQUARE_3_LAYERS_3D_TOP_FILLED` when on.
  - Label UI reuses the map label button style with `Off`, `Abbr`, and `Name`.
    National Parks default to labels off.
- Add exports:
  - JSON includes normalized note metadata and priority naturally.
  - Markdown/RTF/Text add Waypoint Packs sections when linked pack notes exist.
  - Wayfinder exports should group pack-created notes under their pack name
    while preserving existing Wayfinder behavior.

## Follow-Up Wish

WISH-066 tracks better support for going from one pack to many: pack categories,
search/filtering, multiple active overlays, import-ready data, and clearer
multi-pack active state without crowding Wayfinder.

WISH-067 tracks first-class Links and Photos controls in notes.

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

- New map defaults: pack overlay off, pack labels off, no state recoloring.
- Open Packs from Wayfinder; confirm an inset panel appears over Notes and the
  map remains visible.
- Select National Parks from Available Packs; choose an icon, overlay state, and
  label mode.
- Select National Monuments; confirm 138 items, Wikipedia links, and prefilled
  `Date Established | Description` note details.
- Add National Parks through preview; confirm one Wayfinder note per included
  park.
- Use preview priorities and notes; confirm priority badges and note details
  persist.
- Re-run Add/Refresh; confirm managed fields update and user-entered fields are
  preserved.
- Attach an existing note from the pack panel and from the note editor.
- Mark a pack-created Wayfinder note visited; confirm it stays linked and marker
  color changes.
- Remove the pack; confirm untouched generated notes are removed and
  edited/visited notes are preserved.
- Verify label modes: Off, Abbr, Name.
- Verify pack overlay pins are teal and priority pills follow the requested
  green-to-orange scale.
- Verify Alaska pack pins line up against the Alaska inset and Aleutian frame.
- Verify priority search/filter/sort/export behavior.
- Verify JSON export/import round-trips pack metadata and priority.
- Smoke US/World switching, normal note pins, Wayfinder, Rangefinder, and
  existing exports.

## Assumptions

- Waypoint Packs are implemented inside the single-file app with no runtime
  dependencies.
- National Park data is a static bundled snapshot sourced from official NPS data
  outside runtime.
- Priority is a note field, not a Location Tag.
- Pack identity is metadata on notes, not inferred from text.
- Pack markers are visually separate from state progress and should not recolor
  states automatically.
