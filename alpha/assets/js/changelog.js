// Trail Log — release notes data (const CHANGELOG), moved out of index.html to
// keep it token-light. Loaded before the main app script. Release-note format
// rules live in context/LLM_HANDOFF.md.

    const CHANGELOG = [
      {
        version: "4.6.1",
        date: "2026-06-15",
        title: "A Small World",
        summary: "Map switching responds sooner, shows clear loading progress, and restores its keyboard shortcut.",
        highlights: [
          "Map switching refreshes only the surfaces that depend on the active map.",
          "The switch button shows its destination, spinner, and progress while loading.",
          "Shift+Control+Option+~ reliably switches between the US and World maps.",
        ],
        updateSections: [
          {
            heading: "Faster Feedback",
            items: [
              "Switching maps refreshes the map, Legend, Notes, Rangefinder, and related controls without rebuilding unrelated app surfaces.",
              "The inactive map remains fully removed from layout and painting so normal app interactions stay responsive.",
              "The map switch button changes to a destination label, spinner, and progress line before the next SVG begins painting.",
              "The selected map is persisted after the destination has painted instead of delaying the visible switch.",
            ]
          },
          {
            heading: "Keyboard Shortcut",
            items: [
              "Shift+Control+Option+~ now switches between the US and World maps as advertised.",
              "Physical Backquote and Option-produced dead-key variants are normalized across keydown, keypress, and keyup.",
              "A held-key latch prevents missed shortcuts and accidental double map toggles.",
            ]
          }
        ]
      },
      {
        version: "4.6.0",
        date: "2026-06-15",
        title: "The Whole Story",
        summary: "Notes gains a full Detailed view, and individual locations can switch among all four note layouts.",
        banner: "Detailed Notes shows every field in full, with all four views available inside each location.",
        cta: "Read the|Whole Story!",
        highlights: [
          "Detailed view shows complete location and note information without truncation.",
          "Detailed is the default view for fresh Notes lists.",
          "Individual locations now offer Detailed, Expanded, Condensed, and Text Only views.",
          "Detailed cards support inline details editing and linked Waypoint actions.",
        ],
        updateSections: [
          {
            heading: "Detailed Notes",
            items: [
              "Added a Detailed view before Expanded using the diagonal-expand icon.",
              "Each location card shows its type, applied levels, note count, and available date span.",
              "Detailed card headers place location precision, level, and color-matched Location Tags on one readable line.",
              "Location reads as Where in City; Event reads as What with Who in a balanced two-column summary.",
              "Coordinates stay out of Detailed cards, while complete details text remains untruncated.",
              "Priority can be changed directly from any Detailed card.",
              "Priority menus now stay compact with direct square choices for blank or priorities 1 through 5.",
              "Linked Waypoint controls now appear in both the main Notes list and individual locations.",
              "Location summaries keep the date range and note count together on one line.",
              "Detailed and Expanded location headers show the date span and note count with a clearer divider; the count now reliably collapses or reveals that location's notes and shows a disclosure chevron that points down when open and right when collapsed.",
              "Expanded note priority badges stay attached to the Waypoint icon when present, otherwise the first map-winning icon, and now tuck in from the corner so they no longer clip at a row's right or bottom edge.",
              "The priority badge no longer appears in the denser Condensed view.",
              "Every visual note row or card shows coordinate status: a plain target with a \"Coordinates: NONE\" hint when unmapped, or a dotted target showing the saved latitude and longitude when mapped.",
              "In Expanded location headers the disclosure chevron is smaller, and the date span and note count stay right-aligned in the header.",
              "Right Arrow now cycles the Notes sort order, while Down Arrow cycles the four note views.",
              "Detailed layouts wrap naturally without fixed row heights, ellipsis, or line clamping.",
            ]
          },
          {
            heading: "Location Notes",
            items: [
              "The Visit Notes section inside an individual location now includes the same four-view selector as the main Notes list.",
              "The Visit Notes heading and view controls stay pinned while scrolling a location's notes.",
              "Clicking a Detailed card's details text opens an inline editor with a live character count and checkmark save.",
              "Cmd/Ctrl+Enter saves inline Detailed edits and the full note editor's Additional Details; plain Enter keeps inserting a new line.",
              "Additional Details now accepts up to 2,000 characters in both the full editor and Detailed cards.",
              "Space and Enter remain normal text input while editing Detailed card details.",
              "Back returns to the previous scroll position in the location list.",
              "Down Arrow cycles all four views; Right Arrow cycles all three sort modes.",
              "Condensed Visit Notes uses tighter rows and smaller date/summary text so more notes fit on screen.",
              "Linked Waypoint notes expose website, photo, and priority controls beside Edit and Delete.",
              "Switching views keeps one saved preference across the main list and selected-location notes.",
              "Existing saved Expanded, Condensed, and Text Only choices remain intact; new/default settings start in Detailed.",
            ]
          }
        ]
      },
      {
        version: "4.5.2",
        date: "2026-06-14",
        title: "Get Your Bearings",
        summary: "Rangefinder's ring-style menu stays open for quick multi-changes, and the Legend totals now show which grouping they're measured against.",
        highlights: [
          "Rangefinder's ring-style menu stays open so you can try fill/clip options and see them live.",
          "The Legend totals show an icon for which grouping (US, World, or a Waypoint pack) they count.",
        ],
        updateSections: [
          {
            heading: "Rangefinder",
            items: [
              "The ring-style (\"circle options\") menu now stays open after each pick — change fill and clip and watch the rings update live; it closes when you click outside it.",
            ]
          },
          {
            heading: "Legend",
            items: [
              "The overall-completion pill in the Legend header now shows a small icon (on the right, so the totals stay lined up with the per-level rows) for which grouping the stats are measured against — the US map, the World map, or, when a Waypoint pack is driving the numbers, that pack's icon.",
              "The map label selector now uses the US or World map icon for the base map option instead of a generic circle, matching the Legend grouping indicator.",
              "Map icons in the label-target picker stay neatly inside their buttons; the World icon is optically balanced in both the label control and Legend pill.",
              "Selecting National Parks labels now shows the National Parks icon beside its Legend stats.",
              "US and World icons now inherit the active theme, and the Legend divider stays a clearer fixed height beside the larger World icon.",
            ]
          }
        ]
      },
      {
        version: "4.5.1",
        date: "2026-06-12",
        title: "Back in the Picture",
        summary: "The “Add as App” icon previews show their artwork again instead of just a colored background.",
        highlights: [
          "Fixed the “Add Trail Log as an App” icon previews showing only a colored square.",
        ],
        updateSections: [
          {
            heading: "Fixes",
            items: [
              "The Light and Dark icon previews in “Add as App” (and the home-screen icon they show) render their book-and-globe artwork again — an image path had broken when the styles moved into their own file a few releases back, leaving only the background color.",
            ]
          }
        ]
      },
      {
        version: "4.5.0",
        date: "2026-06-12",
        title: "Leave No Trace",
        summary: "A big pass over the small-screen experience: Basecamp, Notes, the map, the note editor, pop-up menus, and linked-note photos all behave properly on phones now.",
        banner: "A big mobile cleanup: two-step Basecamp, taller Notes, fixed maps, menus, photos & more.",
        cta: "Tidy the|Trail!",
        highlights: [
          "Basecamp on phones: a pad list, then a full-screen editor with a Back button.",
          "Notes fill at least 75% of the screen on mobile.",
          "Switching to the World map now replaces the US map instead of stacking it.",
          "Tip Jar, the note editor, and pop-up menus all behave on small screens now.",
        ],
        updateSections: [
          {
            heading: "Mobile",
            items: [
              "Basecamp on phones is now a two-step flow: a full-width vertical pad list, then a full-screen editor for the chosen pad with a Back button to return to the list.",
              "Notes now fill at least 75% of the screen on mobile and grow taller as notes pile up or a Waypoint pack is opened over the column.",
              "Switching to the World map now replaces the US map instead of rendering it stacked underneath.",
              "The note editor scrolls properly on phones with the lower fields and Save button reachable, and its title now drops to its own line below the action buttons so they never cover it.",
              "On phones the note editor's location fields are arranged for easier entry: Latitude and Longitude share the top line, the map-status text sits beneath them, then a full-width City and a full-width Where each pair with their small action button; longer tag labels (like \"National Parks\") shrink slightly so they stop truncating.",
              "On a linked Waypoint-pack note, the editor header's extra Website / Photo / priority / Link controls now drop to their own line so the header never grows wider than the screen, and that cluster's border hugs its buttons instead of stretching across the row.",
              "Tip Jar fully closes on mobile instead of lingering at the bottom of the screen, and its earlier double-scrollbar fix carries over.",
              "Rangefinder's ring-style (\"circle options\") menu opens fully on screen instead of clipping off the left edge, and its panel title wraps to two lines so the header buttons no longer truncate it.",
              "Basecamp's formatting menus (Format, Font, Text) now stay on screen instead of clipping off the right edge.",
              "Basecamp's pad-list search field no longer collapses behind the New Pad button.",
              "The map's zoom controls sit centered in scroll view, lined up with the notes-pin and label rows below.",
              "Smart Color Swatches keep each palette's color swatches and Apply button together on one line, with the palette name on its own line above.",
              "Waypoint Pack Locations puts the search bar on its own line with the map and action buttons beneath it, so nothing is cramped or cut off.",
              "Fixed the linked-note photo on phones and desktop: the Wikipedia preview image loaded but its frame collapsed to zero height and overlapped the fields, so nothing usable appeared. Waypoint-pack note photos now show in full — the frame sizes to each photo's own proportions, so nothing is cropped on desktop or phones — sitting at the top of the editor below the header and above Smart Convert; on phones tapping the photo button scrolls the editor up so the photo is in view.",
              "Removed the \"P#\" priority badge from note rows for a cleaner, less cluttered list.",
              "Added Roadmap ideas for two-finger pinch-to-zoom on the map and showing where a pack photo was taken (its camera location) to help recreate the shot in person.",
            ]
          }
        ]
      },
      {
        version: "4.4.4",
        date: "2026-06-10",
        title: "Fine Print",
        summary: "Release notes get quieter and clearer: patch updates no longer pop the What's New banner, and the Full Update List now tallies its sections and updates.",
        highlights: [
          "Patch releases no longer pop the What's New banner — only feature updates do.",
          "The Full Update List now tallies its sections and total updates at a glance.",
        ],
        updateSections: [
          {
            heading: "Release Notes",
            items: [
              "The What's New banner now appears only for feature releases (major or minor); patch releases ship quietly without it.",
              "The Full Update List toggle now counts the sub-bullets across every section, showing an \"X sections · Y updates\" tally instead of only the section count.",
            ]
          }
        ]
      },
      {
        version: "4.4.3",
        date: "2026-06-10",
        title: "Clear View",
        summary: "The Waypoint Packs panel now opens as a clean full-height card over Notes, fixing a case where it opened half-hidden behind the notes controls in condensed Wayfinder view.",
        banner: "Waypoint Packs now opens as a clean full card over Notes — no more peeking rows.",
        cta: "Clear the View!",
        highlights: [
          "Fixes the Waypoint Packs panel opening half-hidden behind notes controls.",
          "The panel now covers the full Notes column and scrolls into view when opened.",
        ],
        updateSections: [
          {
            heading: "Waypoint Packs",
            items: [
              "Fixed the Waypoint Packs panel rendering partly behind the notes control row in condensed view with Wayfinder mode on; it now opens as a full-height floating card over the Notes column instead of relying on a fixed top offset that the taller header overflowed.",
              "The panel now scrolls into view when opened, so it is visible even when the Notes column sits below the fold on tablet and phone layouts.",
              "Hid the notes lists beneath the open panel and dropped the sticky positioning on category headings while it is open, fixing a State group heading that could linger over the panel — whether the group was collapsed or expanded — until the next repaint.",
            ]
          }
        ]
      },
      {
        version: "4.4.2",
        date: "2026-06-10",
        title: "True Colors",
        summary: "Waypoint pack icons — the National Park arrowhead and National Monument obelisk — now follow the light/dark theme everywhere, matching every other icon on every surface.",
        banner: "Pack icons now match the light/dark look of every other icon, on every surface.",
        cta: "Show Your|True Colors!",
        highlights: [
          "National Park and Monument icons follow the theme on every surface.",
          "Fixes invisible or mismatched pack icons in compact notes and Basecamp linked notes.",
        ],
        updateSections: [
          {
            heading: "Icons",
            items: [
              "Waypoint pack artwork now derives its color from the surrounding surface exactly like all other icons, instead of shipping fixed black fills patched per surface.",
              "Fixes the National Park arrowhead rendering invisible or off-theme in compact note rows, per-state icon stacks, and Basecamp linked notes, and keeps marker, picker, filter, and panel renderings consistent in both themes.",
              "Condensed note rows keep their intentional hollow-arrowhead style, now keyed to the row's ink color in both themes.",
            ]
          }
        ]
      },
      {
        version: "4.4.1",
        date: "2026-06-10",
        title: "Ultralight",
        summary: "Trail Log sheds pack weight: bundled icon art, map art, release notes, and roadmap data move into companion files, so the app loads the same everywhere while its core file stays lean.",
        banner: "Same trail, smoother footing. Faster, lighter, leaner, and improved beneath the surface.",
        cta: "Shed Some|Pack Weight!",
        highlights: [
          "Moved icon art, map art, styles, release notes, and roadmap data into companion files.",
          "Same app everywhere: still offline-first with no build step or dependencies.",
          "Removed dead code and parked unused icon art for a lighter download.",
        ],
        updateSections: [
          {
            heading: "Under the Hood",
            items: [
              "Moved the SVG icon library, US/World map artwork, Release Notes data, and Roadmap data out of the core file into plain companion scripts under assets/js (icons.js, maps.js, changelog.js, roadmap.js) loaded ahead of the app script.",
              "More Icons discovery now reads a generated icon registry instead of scanning script source text, also removing an eval call site.",
              "Moved all app styles into a companion stylesheet (assets/css/app.css) loaded from the head — same look everywhere, still no build step.",
              "Cleaned house: removed seventeen unused functions and an orphaned lookup, and moved fifty-six unused icon graphics out of the app bundle into a dev-side archive.",
              "Simplified release-note entries: the What's New banner now derives its version and title from the release itself, with a dedicated banner blurb replacing the old duplicated notice block.",
              "Refreshed the README and Roadmap descriptions for the new companion-file layout.",
              "Tidied the repo: favicon, Apple touch, PWA, and brand-icon art now lives in assets/icons (head links, both manifests, Install dialog thumbnails, and the icon build pipeline updated to match); dormant icon source material moved under build/ and out of deploys; retired the bundled icon-kit templates.",
              "No behavior, schema, or data changes — saved Trail Logs load exactly as before.",
            ]
          }
        ]
      },
      {
        version: "4.4.0",
        date: "2026-06-09",
        title: "Basecamp Pads",
        summary: "Basecamp Pads turns the Basecamp scratchpad into a workspace of named rich-text pads with linked notes and exports.",
        banner: "Basecamp grows into a workspace of named, rich-text pads, with linked notes, search, and exports.",
        cta: "Note|Away!",
        highlights: [
          "Open Basecamp with up to 20 named, icon-tagged, rich-text pads.",
          "Sort, search, customize, and format away on each pad.",
          "Link existing location notes into a pad for reference and context.",
          "Adds Prev/Next note nav, global close with Escape, Map polish and fixes.",
        ],
        updateSections: [
          {
            heading: "Basecamp",
            items: [
              "Turned Basecamp into a multi-pad workspace storing up to twenty named pads with their own icons, sanitized rich-text HTML, derived plain text, timestamps, and linked-note references in additive state alongside the existing Trail Log data.",
              "Migrated the legacy single Basecamp scratchpad once into the first pad titled \"Basecamp Pad\" with the default Basecamp pad icon, preserved original paragraphs, line breaks, and last-updated timestamp, and locked the migration so it never overwrites pads that already exist.",
              "Added a responsive Basecamp dialog with a select/reorder-only pad sidebar, large editor pane, dockable and full layouts, header click-to-rename and click-to-pick-icon controls, and per-pad Delete.",
              "Added drag plus Alt+Up/Alt+Down keyboard reorder for pads and a + New Pad action that focuses the header rename input.",
              "Added cross-pad name and content search with match counts, temporary in-editor highlights that stay selectable, and / to focus the search input matching the rest of Trail Log.",
              "Introduced the Format toolbar group: heading, subheader, body, monostyled, dashed list, bullet list, numbered list, and checklist with toggleable check state that survives sanitization and exports.",
              "Introduced the Font toolbar group: bold, italic, underline, strikethrough, highlight, shadow, double underline, double strikethrough, smaller/default/bigger sizing, subscript/default/superscript baseline.",
              "Introduced the Text toolbar group: align left/center/right, justify left/full/right, quote decrease/toggle/increase, and independent indent decrease/toggle/increase.",
              "Introduced the Other toolbar group: Link, Code Block, Clear Formatting, and a placeholder Image action reserved for a future update.",
              "Added editor-local Cmd/Ctrl+Z and Cmd/Ctrl+Y undo/redo covering typing, paste, link insertion, checklist toggles, and toolbar-driven formatting mutations.",
              "Added Cmd/Ctrl shortcut chips that appear on toolbar buttons while the modifier is held and mapped the main Basecamp formatting shortcuts to those actions.",
              "Sanitized saved and pasted Basecamp HTML to a safe allow-list of tags, attributes, link targets, and toolbar-generated classes while keeping plain-text line breaks and link URLs.",
              "Added Link Note search across US and World notes to attach existing location notes to a pad, with open and unlink controls, and kept Basecamp open behind the linked-note editor so closing it returns to the same pad.",
              "Added Copy Pad and Copy All Pads flows that respect the active pad and ordered pad list.",
              "Added per-pad Basecamp sections to Markdown, Rich Text, and Plain Text exports, including checklist state and linked-note labels, while JSON backups continue to carry every pad.",
              "Removed Basecamp's per-keystroke DOM normalization and full-document parsing, dropped the offscreen plain-text layout, and hid Developer JSON rendering for noticeably smoother typing in large pads.",
              "Refreshed the Help Center with a dedicated Basecamp section, expanded the FAQ entries describing the 4.3.0 → 4.4.0 \"Basecamp Pad\" migration, and updated the README feature list and Roadmap to reflect the shipped Basecamps surface."
            ]
          },
          {
            heading: "Other",
            items: [
              "Added Previous/Next note navigation with cross-location step-through so reviewing a run of notes no longer requires closing and reopening each one.",
              "Added a capture-phase Escape handler so closing a dialog never exits browser fullscreen, plus broader Esc handling across modals.",
              "Made Enter activate the primary action across the note editor and other dialogs.",
              "Polished the Map Labels picker active state across themes: moderate gray plus ring in light mode with icons keeping their own color, restored charcoal in dark mode, and clearly visible keyboard selection in light mode.",
              "Made the NPS arrowhead surface-aware (white-on-pin in light theme, flipped to white inside the dark Waypoint Packs modal), expanded the NPS level color, and kept the pack icon visible through Shortcut Mode.",
              "Polished pack tag visuals, stripped a redundant pack pill from one header, and tightened label shortcuts and note hotkeys.",
              "Fixed world search and World Locate so coordinate scoping and projection respect the active map layer.",
              "Updated Smart Convert to keep commas inside in/at/for/with phrase values so \"in Mason, OH\" no longer truncates the city at the comma."
            ]
          }
        ]
      },
      {
        version: "4.3.0",
        date: "2026-06-07",
        title: "Waypoint Packs",
        summary: "Waypoint Packs turn curated collections into prioritized, map-ready Wayfinder notes.",
        highlights: [
          "Add National Parks and Monuments as prioritized Wayfinder notes.",
          "Preview photos, links, priorities, and notes before adding locations.",
          "Attach existing notes while preserving dates, levels, and details.",
          "Track progress with synced map markers, labels, Legend stats, and exports."
        ],
        banner: "Add curated place packs as prioritized Wayfinder notes and track their map progress.",
        cta: "Pack the|Map!",
        updates: [
          "Polished release copy, Help guidance, and implementation notes for the Waypoint Packs release.",
          "Opened Waypoint Packs with no pack preselected and added a compact choose-configure-preview flow hint.",
          "Made selecting a Waypoint Pack immediately apply its saved label mode to that map overlay.",
          "Centered the Map Labels target icon when no linked Waypoint Pack picker is present.",
          "Added a Wayfinder setup popup for choosing an existing Legend level or adding the recommended Want to Visit level.",
          "Refreshed Help Center, FAQ, hints, README, and release-prep context for Waypoint Packs.",
          "Show Developer Mode split-percentage pills only during active divider drags.",
          "Moved waypoint labels into a top draw layer so nearby marker icons cannot cover them.",
          "Added dash-aware and three-line waypoint name wrapping with wider line spacing.",
          "Let waypoint labels try below a marker when the preferred top placement would cover another icon.",
          "Nudged the map Labels target icon to read centered inside its picker cell.",
          "Kept priority badges visible on map note pins whenever their icon is visible.",
          "Split long Waypoint Pack map names across space-balanced lines and kept visible pack labels inside the map bounds.",
          "Changed the normal map Labels target icon from a tag to circle.circle.fill.",
          "Made Wayfinder levels count in Legend denominators and row percentages without counting as completed.",
          "Kept hard-excluded levels out of normal and Waypoint Pack Legend denominators while still showing their counts.",
          "Made Legend stats follow the selected map Labels target: normal labels use location stats, pack labels use linked pack note stats by level.",
          "Slightly enlarged the Labels target chevron and fixed linked waypoint label color in dark mode.",
          "Sized the map Labels target icon and chevron correctly and applied waypoint labels to existing linked note pins.",
          "Restored normal state and territory labels as an exclusive map Labels target beside linked waypoint packs.",
          "Made the map Labels pack chevron open only as a pack icon picker and moved pack labels to the standard label buttons.",
          "Kept Pack Locations search and actions on one header row with search stretching across the available space.",
          "Made hidden excluded-location filters hide excluded-level note pins even inside visited locations.",
          "Moved the Waypoint Pack label dropdown into the existing map Labels control beside the tag icon.",
          "Added Pack Locations search for quickly finding waypoints to link or edit.",
          "Preserved Pack Locations scroll position when opening lower photo previews.",
          "Turned Waypoint Pack overlays off when leaving Wayfinder and restored normal note pins.",
          "Made active and inactive Waypoint Pack icon filters visually distinct in Notes.",
          "Added an added-pack dropdown beside map labels for switching packs and changing pack label modes.",
          "Kept Waypoint link menus clamped to the viewport so wrapped-row popups are not cut off.",
          "Let Waypoint Pack icon filters stay off after a user turns them off in Notes.",
          "Merged waypoint default park details into Additional Details when linking from the note editor.",
          "Preserved Pack Locations scroll position when opening or choosing Link Existing Note menus.",
          "Selecting a Waypoint Pack turns its overlay on and applies its saved label preference.",
          "Converted Waypoint priority controls into single shaded popout buttons in pack rows and linked note headers.",
          "Moved linked note priority, Website, Photo, and Link to Waypoint controls into a teal note-header container.",
          "Limited note-header waypoint choices to available pack places in the note's location and kept linked note cities intact.",
          "Highlighted linked waypoint-managed Where, Locate, latitude, and longitude controls in teal.",
          "Added Priority sorting to Notes and removed priority/source pills from expanded note rows.",
          "Merged Pack Location link status into the contextual Link/Edit button, compacted square controls to 40px, and tightened priority type.",
          "Moved pack overlay and label controls into the Pack Locations header and anchored a stronger outlined note-choice menu directly below Link.",
          "Added live split-percentage pills above resize dividers in Developer Mode.",
          "Made Pack Location rows share one line when space permits, enlarged action icons, and restyled priority choices as compact large-number outline controls.",
          "Changed Link Existing Note into an immediately expanded real-note list so available choices are visible without another click.",
          "Kept Waypoint Packs slightly inset within the resizable Notes panel and matched its close button to other modal close controls.",
          "Kept Pack Location actions aligned in a responsive toolbar and removed placeholder choices from link-note menus.",
          "Rebuilt Pack Locations as responsive toolbar rows with wide wrapping names, Website and Photo actions, priority, contextual Link/Edit, and Unlink.",
          "Added on-demand inline Wikipedia photo previews and moved state-scoped note attachment behind the Edit/Link button, with unavailable actions disabled.",
          "Kept Waypoint Packs open behind linked-note editing so closing the note returns to the same pack context.",
          "Collapsed linked Pack Locations into compact rows with dedicated contextual Edit and Unlink icons.",
          "Made National Monument artwork white on maps in light mode and black in dark mode, with the inverse treatment in Notes.",
          "Shortened Pack Locations to waypoint names, hid linked-note drafts, and added Unlink.",
          "Linking an existing note appends the waypoint note to Additional Details, preserves City, and updates Where and coordinates.",
          "Merged Add/Refresh and Pack Notes into one compact Pack Locations list with contextual Attach/Edit actions.",
          "Moved each location's priority controls between its name and info link to reduce vertical space.",
          "Limited Attach Existing Note choices to available notes in the waypoint's listed state or states.",
          "Rendered the National Monument silhouette as native map SVG so it reliably appears inside waypoint circles.",
          "Embedded the National Park Service and National Monument artwork directly with the app's SVG constants.",
          "Made the National Monument glyph white and moved waypoint labels above markers so priority badges stay clear.",
          "Replaced preview checkboxes with bordered location selectors; teal-highlighted locations are included.",
          "Added dedicated National Park Service and National Monument SVG Location Tags as each pack's recommended icon.",
          "Existing linked Parks and Monuments migrate from their legacy default tags to the new dedicated SVG tags.",
          "Temporary recommended pack icons now clean themselves out when a previewed pack is closed or left without linked notes.",
          "Preview priority choices now show their numbered map badge immediately, before Add or Refresh creates notes.",
          "Active pack icons receive a teal outline in Notes, while the inactive Wayfinder mode button keeps its normal styling.",
          "Shifted Alaska pack pins east across the inset and increased pack-card artwork and map-label sizing.",
          "Simplified bundled pack note copy to “Established on <date> | <description>”.",
          "Enriched National Park preview notes with static Wikipedia-sourced established dates and descriptions.",
          "Recalibrated Alaska waypoint projection so mainland and Aleutian pack pins spread across the inset.",
          "Changed the Waypoint Packs subtitle to a generic future-endeavors line without linked status.",
          "Selecting a pack now enables its recommended Location Tag and adds it to the end of the active tag order when needed.",
          "Increased map label text for Waypoint Pack markers.",
          "Renamed Suggested Sets to Waypoint Packs and moved the entry point into Wayfinder as a compact Packs button.",
          "Replaced the modal drawer with an inset Waypoint Packs panel over Notes so the map stays visible and interactive.",
          "Added Available Packs cards, visual icon choices, layer-button overlay controls, and map-label-style label controls.",
          "Added National Monuments as a second Waypoint Pack using a static Wikipedia-sourced snapshot with coordinates, established dates, and description-prefilled notes.",
          "Made the Waypoint Packs header generic so it describes the feature instead of the selected pack.",
          "Adjusted Alaska coordinate projection with separate mainland and Aleutian frames so waypoint pins line up better on the inset.",
          "Waypoint Pack overlay pins now use Wayfinder teal, while priority badges use the requested green-to-orange 1-5 scale.",
          "Pack icon choices now follow the user's active Location Tag order, omit hidden tags, and include a compact more button for opening Location Tags.",
          "Pack settings are more compact: overlay sits next to label options, helper labels are removed, the combined label option is gone, and label SVG sizing matches map label controls.",
          "Added a dismissible Waypoint Packs settings hint between Available Packs and the pack settings.",
          "Bundled official National Park-designated units with stable NPS codes, labels, representative coordinates, state lists, URLs, and default note copy.",
          "Pack Location rows let each place be included or skipped, assigned priority 1-5, and annotated before batch creation.",
          "Batch adding creates missing Wayfinder notes, refreshes managed pack fields on existing linked notes, turns the chosen pack icon on, enables the pack overlay, and enters Wayfinder.",
          "Waypoint Pack notes remain normal notes in Notes, filters, Wayfinder, backups, and exports, with lightweight source metadata for duplicate checks and refreshes.",
          "Added optional note priority with compact badges, search/export text, Notes sorting, and pack-preview controls.",
          "Priority now appears as a small number pill on the bottom-right of location icons and pack markers, and linked pack priority changes redraw the map marker immediately.",
          "Added attach flows from the pack panel and note editor so an existing note can join the active pack while preserving user-entered date, level, details, people, topics, and non-pack tags.",
          "Pack markers render separately from normal note pins, use the selected pack icon and Wayfinder teal, and do not recolor whole states.",
          "Pack labels support None, Abbr, and Name modes and remember each pack's preference.",
          "Removing a pack deletes untouched generated pack notes and detaches edited or visited notes so user work is kept.",
          "Markdown, Rich Text, and Plain Text exports group linked pack notes under their pack name while preserving the existing Wayfinder export flow.",
          "JSON backups/imports normalize pack metadata and priority while dropping unknown pack or item ids."
        ]
      },
      {
        version: "4.2.0",
        date: "2026-06-02",
        title: "Rangefinder",
        summary: "Rangefinder adds straight-line planning rings, per-map settings, and travel-time estimates.",
        highlights: [
          "Draw Drive or Plane planning rings on US and World maps.",
          "US and World keep independent Rangefinder setups.",
          "Adjust distances, units, fill, clipping, labels, and speed.",
          "Compare Start-to-End distance with optional time estimates."
        ],
        banner: "Rangefinder adds per-map planning rings, speeds, and Start-to-End estimates.",
        cta: "Find Your|Range!",
        updates: [
          "Added Rangefinder Mode to the map header with the target icon and Shortcut Mode key 5.",
          "Added a paired Rangefinder panel beside the Legend with responsive stacking, desktop placement support, and a resizable Legend/Rangefinder split.",
          "Rangefinder can pick saved coordinate-backed note pins as Start and End points, render target markers, and show a connector when both points are set.",
          "Added straight-line planning rings on both the US and World maps, with independent Drive and Plane travel modes.",
          "Drive defaults to 60, 120, 180, 300, 600, 900, and 1200 mile rings; Plane defaults to 600, 1200, 1800, 3000, 4800, and 7800 mile rings.",
          "US and World maps now remember their own Rangefinder anchors, ring distances, enabled rings, travel mode, units, fill/clip/time settings, and speeds.",
          "Rangefinder rings can be edited, added, removed, enabled, or disabled up to eight bands, with four-column desktop controls and two-column mobile controls.",
          "Ring controls now combine the number and unit into one compact chip; in non-edit mode, clicking the chip toggles that ring on or off.",
          "Added miles/kilometers switching for ring labels, inputs, and Start-to-End comparisons.",
          "Added a Ring Style menu for Fill versus No Fill and Clipped versus No Clip, with land clipping that respects the active map region.",
          "Refined ring rendering so mainland starts do not paint Alaska, Hawaii, or territories, while inset starts keep rings inside their own inset.",
          "Added optional time estimates with adjustable average speeds: Drive ranges from 30 to 120 mph, Plane ranges from 120 to 760 mph, and kph follows the unit toggle.",
          "Range labels now use the restored gold-to-amber palette, larger text, and visible-arc placement when clipping or large world rings push the usual label point off screen.",
          "Added cross-inset comparison cues for pairs such as the contiguous US to Alaska: distance uses real coordinates while the map cue stays visibly non-route.",
          "Fixed Alaska note-pin projection so ordinary pins and Rangefinder target pins land on the visible Alaska inset.",
          "Added dismissable straight-line Rangefinder guidance that explains the non-routing distance model and ring-unit toggles.",
          "Updated Help Center and FAQ copy for Rangefinder, clipped rings, adjustable speeds, inset behavior, and global map support.",
          "Refined Rangefinder and Legend header/button sizing, edit states, delete styling, and disabled Add behavior for denser panel alignment.",
          "Added roadmap follow-ups for route-aware travel times, selectable app/Wayfinder/Rangefinder color themes, antimeridian ring wrapping, and time-based rings."
        ]
      },
      {
        version: "4.1.0",
        date: "2026-05-29",
        title: "Wayfinder",
        summary: "Wayfinder Feature to act as a Bucket List or Planning Mode along with refreshed Keyboard Shortcuts approach for the Power Users.",
        highlights: [
          "Pick which legend level is your Wayfinder, with any name you want.",
          "Teal accents on legend, map, pins, and Notes rows highlight your plans.",
          "Mark Visited promotes a planned spot into a real visit in one click.",
          "Refreshed keyboard shortcut system with a grouped in-app reference."
        ],
        banner: "Set a legend level as your Wayfinder and flip into a focused mode to plan your next adventure.",
        cta: "Start Planning!",
        updates: [
          "Wayfinder is a role you can assign to any single legend level: each level row in the level editor gained a Wayfinder checkbox that spans the full dialog width, and ticking it auto-activates Exclude from Stats so the chord stays consistent. Only one level can be the Wayfinder at a time.",
          "Existing 'Want to Visit' levels are auto-flagged as the default Wayfinder on first load after this update, and their definition is renamed to 'Wayfinder' (custom definitions are preserved).",
          "Added mirrored Wayfinder quick-switch buttons — one on the map header next to Match Notes, one in the Notes panel next to Copy — both wearing a Backpack icon. Pressing either flips the mode and both buttons stay in sync.",
          "Activating Wayfinder Mode snapshots your current level filter, Match Notes state, and excluded-locations visibility, then scopes the level filter to your Wayfinder level, turns Match Notes on, and flips Excluded locations to Shown so your Wayfinder notes always appear. Deactivating restores the snapshot exactly.",
          "A teal 'Wayfinder' pill rides inside the map-switch button, floating just below the map name, whenever the mode is on. The mode persists across reloads and the pill is the guardrail; if no level is eligible to be the Wayfinder, a clear toast explains how to set one up.",
          "Self-heal: deleting the flagged Wayfinder level while the mode is on quietly restores filters and turns the mode off, so the UI never claims an active state with no level.",
          "Teal accents make the Wayfinder easy to spot across the app: the entire flagged legend row tints teal (overriding the blue filter treatment), matching map regions get a teal outline, pins gain a teal halo, and Notes rows for Wayfinder items show a teal left accent strip. All accents vanish the moment the mode flips off, so there's no visual leak.",
          "Quick Add defaults to the Wayfinder level while the mode is active, so planning a new spot is one click plus a region tap.",
          "Added a Mark Visited action to every Wayfinder note row in the selected-location view. Pressing it opens the note editor with the level swapped to Visited and the date set to today (only when the note's date was blank). Cancelling preserves the original Wayfinder note.",
          "Markdown, Rich Text, and Plain Text exports gained a Wayfinder section that lists every note saved at your Wayfinder level, grouped by region. The section hides itself when there are no Wayfinder notes.",
          "Reorganized keyboard shortcuts around three layers: Universal Keys fire without enabling Shortcut Mode (only skipped while typing); Shortcut-Mode keys light up as on-button hints whenever Shortcut Mode is on; and a small set of chord shortcuts (Shift+Ctrl+Option+…) advertise their forms on the matching buttons.",
          "Universal keys: / focuses the Notes filter input (with a discoverable / chip on the right edge of the field); , or < opens Settings (chord form Shift+Ctrl+Option+<); ? jumps to Settings → Help Center; \\ opens Settings → Developer Tools, and a quick double-tap \\\\ jumps straight to the new Keyboard Shortcuts Reference; R opens Release Notes; T toggles light/dark; A opens Add as App; P opens the Tip Jar; H×2 resets dismissed hints and the What's New banner.",
          "Map Panel Header keys (Shortcut Mode): 0 reset zoom, 2/3/4 label modes, 5 switch US/World, 6 Wayfinder (chord form Shift+Ctrl+Option+6 — shown on the Notes-panel button), 7 Match Notes, 8 location pins, 9 Fit/Scroll, − and + zoom.",
          "Toolbar (Shortcut Mode): S is Save/Submit context-aware (Add Note when drilled into a location → Quick Add on the Notes list → otherwise Settings); E renames the map; M, L, N toggle the Map, Legend, and Notes panels; B opens Basecamp, or Back when drilled into a Notes location.",
          "Legend (Shortcut Mode, panel open): U Legend Position, V Auto Colors, W Hide/Show Suggestions, X Legend Edit mode, Y Add Level.",
          "Notes Panel (Shortcut Mode, list view): C Copy, Z Alphabetical sort, T Chronological sort, G Categorical grouping, H Show/Hide Excluded, D Date precision filter, O Coordinate filter, I Tag Settings. Arrow keys swap views: ← Expanded, ↓ Condensed, → Text Only; ← also routes to Back when drilled into a location, and ⌫ / Delete clears applied levels there.",
          "Developer Tools gained an expandable Keyboard Shortcuts Reference grouped by area (Universal, Toolbar, Map Panel Header, Legend, Notes Panel, Notes drilled-in, Note Dialog, Level Dialog, Settings Dialog, Confirm/Other). Each row shows the matching button id in de-emphasized brackets for quick cross-referencing.",
          "Notes panel polish: the header buttons (Quick Add / Copy / Wayfinder / Search) now match the Map header's 40×40 size, a clear padding gap separates them from the secondary toggles below, and the Show Excluded toggle picks up the legend's neutral-gray + dashed-border 'excluded' look when on instead of an accent color.",
          "Smart filter sync: selecting an excluded legend level automatically turns Show Excluded on so the matching notes appear; turning Show Excluded off automatically drops any excluded-level pills from the active filter so the legend never shows pills that produce zero results.",
          "Fixed a map-zoom bug where keyboard +, −, 0 and wheel zooming updated the map but left the zoom percentage stale. The readout and the +/−/reset button enable states now sync on every zoom path, so the displayed value always matches reality.",
          "Cleared the completed Wayfinder item (WISH-036) from the active roadmap and added WISH-060 (Further keyboard shortcut cleanup and integration, P3) to track ongoing polish like remappable bindings and a searchable shortcuts reference."
        ]
      },
      {
        version: "4.0.0",
        date: "2026-05-29",
        title: "Trail Atlas",
        summary: "A switchable World map — log every country right alongside your US states.",
        highlights: [
          "New World map: switch between US and World from the map header.",
          "Log countries like states — levels, notes, and map pins.",
          "Legend, stats, notes, and pins follow the active map.",
          "Countries default to Not Interested, so your stats stay calm."
        ],
        banner: "Switch to a World map and log every country alongside your US states.",
        cta: "Go Global!",
        updates: [
          "Added a World map alongside the US map. The 'World Map' button in the map header switches between them, and your choice is remembered.",
          "Countries support the same visit levels, notes, and map pins as US states. US territories appear on both maps and share a single set of notes and levels.",
          "Every country defaults to Not Interested (excluded from stats) so adding the whole world doesn't overwhelm your progress; the Legend and completion stats scope to the map you're viewing.",
          "Recolored the Not Interested level to a soft gray so the default world reads as calm at a glance.",
          "Notes now group by location type — State, Territory, and Country — and the notes list, search, and map pins follow the active map.",
          "Small island nations and microstates are selectable on the world map, and country pins anchor to the mainland.",
          "Markdown, Rich Text, and Plain Text exports gained a Countries section, and JSON backups include your world data.",
          "Cleared the completed Country Map item from the active roadmap.",
          "Press T anywhere to flip between light and dark themes; in Developer Mode a single tap on the app icon does the same.",
          "Recolored the near-black Not Interested swatch to a neutral #888888 (built-in default and the Classic/Neon palettes).",
          "Moved Want to Visit into the excluded-from-stats category so planned places don't count toward completion.",
          "Location notes now show distinct category icons for States, Territories, Countries, and Cities.",
          "Release Notes now show each release as a scannable list with Highlights visible and a clear toggle for the full update list.",
          "Highlights are capped at four bullets of 100 characters or less; the rest lives in each release's full update list.",
          "Auto Color palettes now fill counting levels from the left and excluded levels from the right, so Not Interested keeps the palette's neutral end color.",
          "Fixed world-map Notes showing countries whose codes collide with US states (e.g. Georgia/Gabon) — each map now reads only its own notes.",
          "Developer Mode now shows each note location's region key in brackets (e.g. [GA]) to make code collisions obvious.",
          "The map title is now the US/World switch: tap the map name and icon at top-left to flip maps; icon and name always show.",
          "Map note pins now use the exact Legend color in both light and dark themes (removed the dark-mode tint).",
          "The default Legend position is now the lower-left corner.",
          "Map switch button now stays a fixed size with a larger icon and never wraps to a second line.",
          "Tuned the Ocean and Earth palettes' Not Interested color so it stays visible on the dark-mode map.",
          "The map switch is now a clearly bordered button with independently sized US and World icons.",
          "Map labels (abbreviation and full name) now work on the World map, showing ISO codes or country names.",
          "Excluded levels (Not Interested, etc.) keep their legend color and get thin diagonal dashes laid over it, so they read as 'set aside' while staying subtle and distinct in light and dark mode — and multiple excluded levels stay tellable apart by color.",
          "Neon, Classic, and Pastel palettes use a balanced mid-gray for the excluded color so it reads evenly in both themes.",
          "Map zoom now reaches 64000%, and the zoom in/out buttons double or halve the zoom each press.",
          "Map note pins keep shrinking as you zoom in, so they stay a sensible size instead of ballooning at high zoom.",
          "Quick Add notes lists every country when the World map is active (and US states/territories on the US map).",
          "Each map control group now sits above its own hint, so the buttons line up on one row and the hints on the next, stacking cleanly on mobile.",
          "Sped up the map, especially the World map: tile positions are cached and zooming/panning now refreshes only the map instead of the whole page.",
          "Map controls now stay side by side on mobile instead of each taking a full row, so the header is more compact on phones.",
          "On desktop the Legend hint sits between the title and the buttons, trimming the Legend header's height.",
          "The icon-filter hint now says Right-Click on mouse devices and Long-Press on touch devices."
        ]
      },
      {
        version: "3.3.0",
        date: "2026-05-28",
        title: "Basecamp Notes",
        summary: "A roomy Basecamp scratchpad for home-base notes that aren't tied to any one place.",
        highlights: [
          "New Basecamp button (or press B) opens a roomy scratchpad.",
          "For planning, packing, gear, and reminders not tied to a place.",
          "Autosaves on this device; rides along in Copy, exports, and backups."
        ],
        banner: "A roomy scratchpad for home-base notes not tied to any one place.",
        cta: "Set Up Camp",
        updates: [
          "Added Basecamp: a dedicated dialog with a large autosaving scratchpad for app-level notes (planning, packing, gear, reminders) that are not tied to a state, territory, or mapped location.",
          "Open Basecamp from the toolbar button beside Notes (matched in size to the other toggle icons) or with the B hotkey.",
          "Copy mirrors the scratchpad to the clipboard with a 'Copied to Clipboard' status flash under the title; Clear wipes it behind a confirmation and is styled red; usage guidance lives in the editor placeholder.",
          "Basecamp text is stored locally in the existing backup schema and is appended to the Markdown, Plain Text, and RTF exports.",
          "Release notice summaries are now capped at 100 characters and each release uses a themed call-to-action.",
          "Cleared the completed Basecamp planning item from the active roadmap and seeded a follow-up for splitting Basecamp into multiple named pads."
        ]
      },
      {
        version: "3.2.0",
        date: "2026-05-28",
        title: "Trail Shorthand",
        summary: "A much smarter, interactive Smart Convert that highlights and promotes note pieces as you type — plus browseable categories for the whole icon catalog.",
        highlights: [
          "Smart Convert highlights dates, places, people, levels, and tags as you type.",
          "Click a chip to fill one field, or Auto Convert to drop everything in at once.",
          "Copied notes now read as clean, paste-ready lines you can drop straight back into Smart Convert.",
          "Tag Settings adds a sticky category chip strip that scopes the icon grid live."
        ],
        banner: "Smart Convert highlights and promotes note pieces as you type, plus browseable icon categories.",
        cta: "Take Note",
        updates: [
          "Rebuilt Smart Convert around a single recognizer so live highlighting, recognition chips, and Auto Convert all agree on what was detected.",
          "Smart Convert highlights recognized dates, cities (in), places (at/near/@), purposes (for), people (with, w/), visit levels, and visit labels inline as you type, with no fields changed until you act.",
          "Each recognized piece appears as a color-coded chip below the field (Tag blue, Date red, Level gray, City indigo, Where purple, What orange, Who yellow); clicking a chip promotes just that piece into its field and removes it from the Smart Convert text. Promoting replaces the field's current value, except visit-label tags which are simply activated and details which are appended.",
          "Pressing Enter while the Smart Convert field is focused now runs Auto Convert instead of saving the note; Auto Convert fills every recognized field and appends leftover text to Additional Details. A hint beside the title reminds you Enter adds every chip.",
          "Smart Convert phrase parsing treats :: and other separators as value terminators, so keyword tokens are recognized even in a separator-delimited line; plain positional splits still work when no keyword is present, and multi-part entries surface as Where/What/Who/Details chips too.",
          "Date parsing now understands ordinal days such as 1st, 2nd, and 3rd in addition to the existing formats.",
          "Smart Convert strips stray square brackets and trims whitespace when routing leftover text to Additional Details.",
          "Plain Text export and the Notes Copy text now render each note as a readable, paste-ready line using keyword tokens (at Where in City with Who for What; details), so a note line can be copied and pasted back into Smart Convert to refill its fields.",
          "Added 17 icon categories — Markers & Time, Travel, Outdoors & Animals, Sports & Fitness, Weather, Tech & Media, Office & Docs, People & Health, Home & Daily, Entertainment, Navigation & Arrows, Audio & Playback, Shapes, Math & Symbols, Numbers, Letters, and Currency — covering every bundled icon, with promoted everyday categories ahead of mechanical ones.",
          "Categories are multi-membership, so cross-domain icons like ticket, microphone, tent, and house appear under more than one chip.",
          "The category chip strip is three rows tall, starts flush at the left edge, uses short chip labels with right-aligned counts, fills the available width when there is no overflow, and remembers its scroll position across selections.",
          "Multi-select chips combine results across categories; long-press or right-click on a chip isolates it, and long-pressing an already-solo chip re-enables All.",
          "A count line describes the current scope using formats like '639 icons in all categories', '100 icons in category Sports & Fitness', and '15 icons in categories Sports & Fitness, Animals, and Home & Daily with search term \\'ant\\''.",
          "Aliased-first ordering inside the More Icons grid is preserved within each category selection, and the grid stays flush against the sticky search + chip strip so it never jumps when the result set shrinks.",
          "Hovering an icon uses a shared overlay anchored to the viewport that clamps to the edge of the screen, so long labels like 'Add American Football Professional' never get clipped.",
          "Compacted Selected Tags rows on phones with tighter padding, smaller name/hotkey inputs, condensed labels, and a slimmer toggle pill so a full set fits without dominating the dialog.",
          "Updated Help Center with a category browsing entry covering chip selection, search scoping, and the long-press isolate gesture.",
          "Cleared the completed Smart Convert and icon-categories planning items from the active roadmap now that both have shipped."
        ]
      },
      {
        version: "3.1.0",
        date: "2026-05-25",
        title: "Trail Echoes",
        summary: "Better note entry, smarter dates/location support, added a notes date precision filter, and richer icon search.",
        highlights: [
          "Smarter Smart Convert: better Date, Location, Purpose, and People auto-fills.",
          "Cleaner note editor: better date picker, nuanced location handling, and bug fixes.",
          "Filter notes by date precision: all, year, year+month, or full dates.",
          "Added over 200 icon aliases for better search and promoted more used icons."
        ],
        banner: "Note entry is quicker now, with saved suggestions, smarter dates, cleaner controls, richer icon search, and date precision filters.",
        cta: "See What's New",
        updates: [
          "Added local autocomplete suggestions for City, Where, What, and Who using existing saved notes, with the current target location prioritized.",
          "Split note location entry into City and Where while preserving existing note text through search, display, export, and coordinate lookup behavior.",
          "Smart Convert now treats @Place and @ Place as at Place and keeps comma-plus-two-letter place suffixes such as Chapel Hill, NC.",
          "Flexible date parsing now accepts YYYY, YYYY M, YYYY M D, YYYY-MM-DD, M/YYYY, M/D/YYYY, M/D/YY, Month YYYY, Month D YYYY, YYYY Month, YYYY Month D, and optional weekday names or abbreviations.",
          "Full note dates show weekday brackets in the date preview, and the date picker groups its fixed-height preview pill, Today/Year Only buttons, Year/Month/Day controls, month chips, and Month/Day optional status more cleanly on desktop and mobile.",
          "Mapped-location status now sits below Latitude/Longitude and above the Move Where hint, stays visible when hints are dismissed, and uses centered Locate and Move icons.",
          "Location Icon Tag search now has broader generated aliases and more plain-language matches for travel, activity, animals, objects, food, weather, appliances, utility, mail, paper, boating, signpost, media, fuel, hand/head, hourglass, search, restroom, trash, trophy, storm, phone, TV, video, and xmark-bin icons.",
          "More Icons now sorts explicitly aliased symbols ahead of unaliased symbols while preserving the active tag order.",
          "Added a persisted Notes date precision filter before the coordinate filter, using All Dates, Year Only, Year and Month Only, and Full Dates Only with matching summary chips and a neutral/cyan/custom-blue/indigo precision scale.",
          "Match Notes map dimming and pins now honor date precision, coordinate, search, level, icon, and excluded-location filters while selected-location detail views continue to show every note for that location.",
          "Removed completed planning items from the active roadmap and retargeted future planning work now that Trail Echoes owns 3.1.0.",
          "Updated Help Center copy and Notes hints so saved suggestions, expanded date formats, City/Where behavior, mapped-location status, date precision filters, and Match Notes behavior are discoverable."
        ]
      },
      {
        version: "3.0.0",
        date: "2026-05-25",
        title: "Meet Trail Log",
        summary: "A place to track where you've been, where you're going, and log memories with an outdoorsy, geeky vibe.",
        highlights: [
          "Maps Show the Way: note-linked pins, clustering, better scroll/fit, custom labels.",
          "The Legend Grew Up: movable placement, drag sort, swipe actions, inline stats.",
          "Notes Supercharged: Quick Add, structured fields, partial dates, tags, and filters.",
          "Power Toolbar: Tip Jar, Add as App, Help Center, and What's New, all polished."
        ],
        banner: "A place to track where you've been, where you're going, and log firsts and memories, with an outdoorsy, geeky vibe.",
        cta: "Explore!",
        updateSections: [
          {
            heading: "Brand, Install, and App Shell",
            items: [
              "Renamed the visible app experience to Trail Log while preserving the existing localStorage key so saved maps keep working.",
              "Updated the document title, default map-name fallback, Settings footer, README, mobile metadata, favicon, Apple touch icon, standalone manifest, and generated icon assets.",
              "Refreshed the README opening so Trail Log's map-first travel journal purpose and local-first setup are clear right away.",
              "Added a left-pinned desktop title bar with a Trail Log app icon and a centered mobile title treatment that keeps the name readable.",
              "Added Add as App guidance with device-aware iPhone/iPad, Android, Mac, and PC instructions, light/dark icon choices, shortcut overlays, Mac reload guidance, and Developer Mode device simulation.",
              "Added Beta and Dev Mode title pills so testing environments are obvious without crowding the main map."
            ]
          },
          {
            heading: "Map, Labels, and Location Pins",
            items: [
              "Added mapped note locations with exact latitude/longitude storage, manual coordinate override, Locate lookup from Where Specifically, and JSON/text export support.",
              "Notes without exact coordinates now render at the center of their state or territory shape instead of drifting to an edge.",
              "Location pins now cluster nearby notes, scale down as map zoom increases, choose cluster color/title from the highest-priority level and earliest note, and use the hex-grid cluster symbol.",
              "Single-note pins open the note; same-location clusters open a picker; nearby clusters zoom while they can separate and then open the picker when max zoom would be a dead end.",
              "Map labels render above location pins, support separate hand-tuned positions for abbreviation and full-name modes, and expose Developer Mode copy-paste snippets while dragging labels."
            ]
          },
          {
            heading: "Notes and Memory Log",
            items: [
              "Added Quick Add Note beside search with a searchable target picker, Save and Add Another actions, and context switching so Locate uses the newly selected location.",
              "Expanded note editing with structured Where Specifically, What For, Who With, Additional Details, partial dates, level selection, coordinate fields, and Smart Convert on a faster inline row.",
              "Location tags now support multiple icons per note, configurable labels, custom or blank hotkeys, enabled/disabled defaults, ordering, search tags, duplicate-hotkey protection, and a large auto-discovered More Icons catalog.",
              "Notes filters now include search, levels, icon tags, untagged notes, excluded-only visibility, and All/Mapped/Missing coordinate precision, with matching SVG symbols in the permanent filter summary.",
              "Expanded, Condensed, and Text Only views were tuned for scanning, copying, sticky category headers, compact icon filters, and selected-location detail views that ignore global list filters."
            ]
          },
          {
            heading: "Legend, Levels, and Stats",
            items: [
              "Legend levels can be edited behind a dedicated Edit toggle, reordered by dragging, and revealed with right-to-left swipe quick actions.",
              "Desktop Legend placement can be changed from a mini corner picker or by dragging the Legend title with live placement previews.",
              "Per-level stats now live inside the color oval, total stats sit under the Legend title, and opt-out levels can be excluded from completion statistics.",
              "Level definitions are visible inline, deleting a level safely demotes affected states, and Smart Colors plus suggested categories remain available for quick setup."
            ]
          },
          {
            heading: "Toolbar, Settings, and Power Tools",
            items: [
              "Settings now covers Appearance, map interaction, date formats, text size, import/export, Location Icon Tags, and local reset utilities with cleaner spacing and consistent controls.",
              "The top toolbar gained Tip, Install, Help, What's New, Settings, Map/Legend/Notes visibility, map zoom, fit/scroll, labels, View Locations, and Match Notes controls.",
              "Developer Mode includes shortcut simulation, hidden command documentation, live export JSON, device detection, install-experience simulation, and reset helpers.",
              "Shift-Control/Option shortcut overlays, hidden H H hint reset, and app-icon quad tap make testing and power use faster without leaving permanent UI clutter."
            ]
          },
          {
            heading: "Help, Roadmap, and Release Notes",
            items: [
              "Help Center and dismissible hints were refreshed for Trail Log branding, map controls, Legend placement, note coordinates, Quick Add, Location Icon Tags, Add as App, Tip Jar, and current filters.",
              "What's New now supports richer major-release copy, highlights, organized full update sections, banner badging, and Learn More routing.",
              "Roadmap cards gained priority coloring, count-aware filters, live search counts, updated priorities, and cleanup for shipped work.",
              "Roadmap now includes future ideas for Basecamp notes, Bucket List mode, weekday date detection, stronger Location Icon Tag search, and choosing the display icon for multi-tag notes."
            ]
          },
          {
            heading: "Data, Compatibility, and Cleanup",
            items: [
              "Existing maps, levels, notes, colors, settings, and import/export data remain compatible through localStorage migrations.",
              "Saved state now covers map zoom, map view mode, pan center, panel visibility, selected location, Notes filters, collapsed categories, text size, and other high-value preferences.",
              "Backups omit obsolete user wishlist data, notes normalize empty coordinates safely, and older 0,0 coordinate mistakes no longer appear as exact mapped notes."
            ]
          }
        ],
        updates: [
          "Opened the 3.0.0 release track.",
          "Renamed the visible app shell from Visit Tracker to Trail Log while preserving the existing localStorage key for compatibility.",
          "Added linked favicon, Apple touch icon, standalone manifest, theme-color metadata, and generated icon files for browser tabs and home-screen installs.",
          "Updated the README title to Trail Log.",
          "Added a title-bar app icon and moved the hidden quad-tap reset gesture from the map title to that icon.",
          "Fixed the map-title fallback so a blank rename restores \"Your Trail Log\" instead of saving literal template text.",
          "Adjusted the title stack so the brand group stays left on desktop while the title keeps a real readable column.",
          "Rebalanced the mobile title width so the app name remains visible between the app icon and rename control.",
          "Scoped the large minimum SVG width to the state map only, fixing the oversized app icon that hid the title.",
          "Reviewed the pending 3.0 changes and refreshed the active release notes so manual branding and icon assets are represented.",
          "Removed completed/obsolete roadmap tickets WISH-033 and WISH-035, and added WISH-036 for a future Bucket List feature.",
          "Added a Tip button in the top toolbar, gift entry points in Settings footer and Help Center, and a compact tip dialog with preset drink tiers.",
          "Added Venmo app/web launch helpers for tip links without adding a payment SDK or tracker dependency.",
          "Added a gift symbol for the Tip control, tightened toolbar symbol sizing, and removed completed roadmap ticket WISH-023 from seeded wishlist data.",
          "Added note latitude/longitude fields, safe migration for older notes, JSON import/export compatibility, text-export coordinate lines, and broader Notes search coverage.",
          "Added map marker rendering for coordinate-backed notes, with nearby marker clustering represented by a visible marker color and icon.",
          "Added an online coordinate lookup from Where Specifically plus location name, with manual latitude/longitude fallback for offline use or override.",
          "Reworked the note location fields so coordinates sit beside Where Specifically, geocode status sits under latitude/longitude, and What For/Who With get their own row.",
          "Improved mapped marker clicks: single-note markers open the note, multi-note same-location markers open a picker, and nearby clusters zoom in before falling back to the picker.",
          "Added an Add Note Here action that pre-fills the top marker location's coordinates, level, location name, and note icons.",
          "Updated Help Center guidance and note hints for coordinate lookup, manual overrides, and clustered map markers.",
          "Removed completed roadmap ticket WISH-030 from seeded wishlist data.",
          "Added an Install Trail Log button between Tip and Settings with a guided dialog that pairs a sleek light/dark icon picker, step-by-step Add to Home Screen instructions for iPhone and iPad, Add to Dock instructions for Mac, and Install app instructions for Android and PC browsers.",
          "Added dark home-screen icon variants (apple-touch-icon-dark.png, icon-192-dark.png, icon-512-dark.png) and a paired dark web app manifest so the chosen icon survives reloads and macOS Add to Dock picks it up after a one-tap reload prompt.",
          "Persisted the chosen install-icon variant so it survives reloads and is applied before the manifest is fetched.",
          "Auto-detected device drives the toolbar Install button glyph: iPhone, iPad, Laptop, or Desktop symbol with a fallback when detection isn't certain.",
          "Added a Device Detection section under Developer Tools that lists the detected type and install icon on one line and the user agent string below, both left-aligned for tight horizontal use.",
          "Added a runtime BETA pill in the title bar that appears when the page is served from a /beta/ path or with ?beta=1 in the query string, sitting beside the Dev Mode pill.",
          "Added a build/ directory with generate-icons.sh and generate-favicon.py that regenerate every PNG icon and the dual-theme favicon SVG from the two source SVGs in icon/.",
          "Switched the Notes summary line to icon-prefixed counters, with the location count beside a location pin and the notes count beside a clipboard glyph.",
          "Refined the title bar so the app icon, name, and the dev/beta pill row share one centered column under the name with consistent left alignment on desktop.",
          "Added a P2 wishlist item for further polish on the Tip / Gift prompt and popup.",
          "Added dark variants of the 16px and 32px legacy favicons (favicon-16-dark.png, favicon-32-dark.png) so the browser tab fallback now tracks the chosen install icon for older or PNG-preferring browsers.",
          "The boot script now sets all icon link tags (favicon PNG, apple-touch-icon, and manifest) in one place before any fetch happens, so the chosen variant is consistent across browser tab and home-screen install paths.",
          "Fixed the favicon SVG generator to emit the generated-by comment after the XML declaration so the file is valid XML and not silently rejected by stricter renderers.",
          "The Mac icon reload prompt now lives inside the Mac Add as App guide instead of appearing as a standalone install-dialog banner.",
          "Fixed the apple-touch-icon-source-dark SVG so its background is the dark pine color instead of the light mint.",
          "Updated the README with a Quick Start subsection covering the optional macOS-only icon build script and a refreshed Repo Layout listing the source SVGs, manifest files, and deploy-excluded folders.",
          "Added a completion handoff rule for copy-paste-friendly commit details and checkpoint commands.",
          "Switched the no-icon indicator in visit notes and expanded rows to the outline circle symbol, colored by the note's level, instead of a solid filled dot.",
          "Added a View Locations toggle to the map header to the right of the Labels segmented group, defaulting to on. When off, location note pins are hidden on the map. Persists in the saved settings.",
          "Added a P3 wishlist item to split the app source into /src with separate HTML, CSS, JS, icon constants, release notes markdown, and wishlist markdown, plus a build step that emits the existing single-file deploy.",
          "Moved the View Locations toggle between Fit Map and the Labels segmented group, and dropped the blue pressed-state highlight since the pin and pin-slash icons already communicate on/off state.",
          "Clustered map pins now use the highest-priority level, then earliest note date, to choose the visible color, icon, and title.",
          "Nearby mapped pins that are too close to split cleanly at max zoom now open the picker instead of continuing a dead-end zoom path.",
          "Clustered map pins now use the hex-grid circle symbol while preserving the highest-priority note title and color.",
          "Smart Convert now keeps its input and Auto Convert action on the same row for faster note entry.",
          "The note editor's Location Tags settings shortcut moved out of the Smart Convert row and into the tag chip row as the compact ellipsis control.",
          "Added a P2 roadmap item for separate map-label positions for abbreviations and full state names.",
          "Single-location Notes now ignore the main Notes search, level, icon, and visibility filters so every note for that location remains visible.",
          "Location Tag hotkey edits now enforce one active tag per key, and clearing a default tag hotkey stays cleared.",
          "Adding a Location Tag now appends it to the end of the active tag list instead of reappearing in its original catalog order.",
          "Default Location Tags can be disabled, renamed, reordered, and assigned custom or blank hotkeys.",
          "Location Tag chips in the note editor now keep a consistent compact width instead of stretching to fill the row.",
          "Mapped note markers now scale down as map zoom increases, making declustered nearby notes easier to inspect.",
          "Added a Quick Add Note button beside Notes search with a location picker, plus Save and Add Another controls for new and edited notes.",
          "Location Tag hotkey duplicates now show a lightweight overlay warning and leave the existing shortcut assignment unchanged.",
          "Updated the Help Center for Quick Add notes and duplicate Location Tag hotkey behavior.",
          "The hotkey-already-used overlay warning now appears center-center of the screen instead of pinned to the bottom-right corner.",
          "The Quick Add Note location picker is now centered in the dialog header so its searchable suggestion dropdown drops straight beneath the search input instead of off to the right.",
          "Editing a note from the all-locations expanded notes view now returns to the expanded notes view after save, instead of dropping into the per-location panel.",
          "Returning from the Location Tags settings to an open note dialog now re-renders the visit-type chip row so newly enabled, renamed, or reordered tags appear without reopening the note.",
          "Location Tag chips now make full use of the dialog width with a four-column grid on desktop and a two-column grid on mobile, so the available space is used evenly.",
          "The hotkey-already-used overlay warning is now rendered through a native dialog element so it appears in the browser's top layer above any open modal, including the note dialog.",
          "Edit Note dialog header now keeps its title left-aligned while the centered location picker sits in the middle of the header and the action buttons stay on the right.",
          "Quick Add Note location dropdown sits beneath its centered input field so the typed-search suggestion list anchors directly under the search box.",
          "Quick Add Note location dropdown options are now sorted alphabetically by state and territory name for predictable scanning.",
          "Notes with exact coordinates now lead their icon row with a small scope dot symbol across the Notes panel, expanded view, and condensed view, so mapped notes stand out at a glance.",
          "Duplicate Location Tag hotkey attempts now surface the warning as a native browser validity bubble anchored to the offending hotkey input, so the message is visible even when the Location Tags settings is on top of every other dialog.",
          "Note dialog header now uses a three-column grid layout that pins the title to the left, holds the Quick Add location picker exactly centered, and pins the action buttons to the right, so the searchable dropdown drops directly beneath its centered input.",
          "Fixed a latitude/longitude save bug where empty coordinate fields were normalized to 0 instead of empty, which made notes appear mapped to the equator/prime meridian. Empty fields now stay empty; the scope-dot indicator also guards against legacy 0,0 notes so they no longer display as having an exact location.",
          "Promoted the Country Map, National Park Overlay, Add Drive Radius, and Bucket List roadmap items to P0 priority.",
          "Note dialog header now uses explicit grid columns (title in column 1, picker in column 2, actions in column 3) so the action buttons stay pinned to the right even when the Quick Add location picker is hidden in Edit Note mode.",
          "Replaced the native datalist suggestion popup with a custom keyboard-navigable Choose Location dropdown so the suggestion list anchors directly under its centered input, supports a taller scrollable area, and styles consistently with the rest of the app.",
          "Map state-name and abbreviation labels now render above the location pin layer so labels stay readable when pins are dense. Marker clicks still pass through the labels.",
          "Added wishlist item WISH-039 capturing the labels-above-pins behavior as a low-effort patch-level entry.",
          "Map state labels now support separate hand-tuned anchor positions for abbreviation and full-name modes. Each state override may now define abbrX/abbrY/abbrDx/abbrDy/abbrAnchor and nameX/nameY/nameDx/nameDy/nameAnchor in addition to the existing shared x/y/dx/dy/anchor fallbacks, so compact abbreviations and longer names can each sit at their own optimal spot.",
          "Developer-mode label drag readout now shows the mode-aware key names (abbrX/abbrY or nameX/nameY) and emits a copy-paste snippet keyed to the active label mode.",
          "Removed wishlist item WISH-039 (Separate State Label Positions) after shipping the feature.",
          "Save and Add Another now closes and reopens the note dialog cleanly so the new note's header layout fully re-renders with the title left-justified instead of stuck mid-transition.",
          "Refreshed the Tip Jar modal: wider 780px footprint, three-column tier grid (collapsing to two on mobile, one on narrow phones), inline drink SVG glyphs in tinted icon chips, friendlier intro copy, gift symbol on the Send Tip button, and a polished Pick-your-own-number block.",
          "Each Tip Jar tier now shows a ⇧⌘⌥ keyboard hint and accepts ⇧⌘⌥+1 through ⇧⌘⌥+9 to fire the matching tier directly from the keyboard.",
          "Removed wishlist item WISH-037 (Better Tip / Gift Prompt and Popup) after shipping the redesign.",
          "Tip Jar Close button now renders the X glyph in icon button mode, matching the rest of the close-button family.",
          "Send Tip button now renders the paperplane glyph in icon button mode, and carries a ⇧⌘⌥S keyboard shortcut that submits the Other amount from anywhere in the dialog.",
          "Removed the per-tier ⇧⌘⌥+digit shortcut hints. The single ⇧⌘⌥S shortcut on Send Tip is the only modifier-key combo surfaced in the dialog.",
          "Each Tip Jar tier now shows its cheeky data-note tagline as a subtitle under the drink label so the playful copy lands in the UI, not just the Venmo memo.",
          "Added wishlist item WISH-040 to refine the inline drink SVGs in the Tip Jar dialog into a polished, consistent set.",
          "Added a compact Notes coordinate filter that cycles between All, Mapped, and Missing so mapped note locations can be reviewed without adding another full toolbar group.",
          "Moved Copy beside Quick Add in the Notes header, changed the excluded-location toggle to a single circle-slash glyph with color-coded state, and made the Missing coordinate filter use the scope-dot glyph with amber state coloring.",
          "On mobile, the Tip Jar's Pick your own number form now sticks near the bottom of the dialog while browsing the preset tiers.",
          "Location notes without latitude/longitude now render at the center of their state or territory map shape instead of falling back to an edge placement.",
          "Help Center copy now explains that exact coordinates make map note pins more precise while notes without coordinates use the map shape center.",
          "Tip Jar drink labels and SVG artwork were refreshed, and tier glyphs now scale to about 75% of their icon chip for more consistent visual weight.",
          "Add as App now detects the install platform, expands the matching iPhone/iPad, Android, Mac, or PC directions, and keeps the other three guides collapsed.",
          "The Add as App dialog now uses a wider, denser layout with SVG icon controls, checked icon previews, shortcut badges for icon choice/device guides/reload, and a Help Center refresh.",
          "Removed the completed Add as App roadmap item after shipping the polished install flow.",
          "Refactored the Tip Jar to a data-driven tier list: a single TIP_TIERS array of {amount, label, tagline, icon, note, iconScale} feeds renderTipJarTiers() into #tipTierGrid at init, with each drink SVG kept as its own __DRINK_* constant. Editing or reordering tiers is now one line per change.",
          "Tier click handling switched to event delegation on #tipTierGrid so future re-renders of the tier list can't lose their click bindings.",
          "House Rail ($10) and Next Round ($25) glyphs now render at 1.3x scale via a per-tier iconScale, so their visually-padded source SVGs read at a comparable size to the rest of the drink set.",
          "Fixed the Tip Jar tier SVG max-width and max-height caps so they multiply by the per-tier iconScale variable instead of clamping to a fixed 75% of the chip; the House Rail and Next Round 1.3x scale now actually grows the rendered glyph.",
          "Added a Match Notes toggle to the map header (right of View Locations) that applies the active notes filters — search query, level filter, icon filter, coordinate filter, and excluded-visibility — to the map view. Non-matching states dim to 35% opacity and location pins for non-matching notes are hidden. Off by default; persisted in saved settings; keyboard shortcut 4.",
          "Notes filter mutations — search input, level chip toggle, icon chip toggle, coordinate-filter cycle, and excluded-visibility toggle — now refresh the map live when Match Notes is on, so the map view stays in sync with the notes panel as you change filters.",
          "Match Notes now honors the coordinate filter (All / Mapped / Missing) alongside the other filters. State dimming uses the existing stateMatchesCoordinateFilter helper; location pins respect the per-note variant so Mapped keeps pins, Missing hides them, and All shows everything.",
          "Match Notes now defaults to on so the map reflects the active notes filters out of the box. Existing users without a saved preference for this setting get migrated to on; explicit off choices are preserved.",
          "Roadmap cards now use subtle priority coloring with a small colored pill and left-edge accent for P0 through P3.",
          "Polished Add as App with cleaner icon cards, matched two-column guide widths, centered step rows, top-positioned Mac icon reload notice, one-open other-device guides, and Developer Mode install-device simulation.",
          "Moved the Notes panel tag-settings ellipsis into the icon filter chip flow so it sits directly after the last visible chip.",
          "Reorganized Help Center documentation and FAQ into focused Toolbar, Map, Legend, Notes, and Other sections, with refreshed hints for the current toolbar, map, legend, and notes controls.",
          "Added roadmap ticket WISH-041 for supporting more Legend levels beyond the current five-level cap.",
          "Add as App button now applies a per-platform iconScale via the same CSS-variable technique used for the tip-jar tiers. Laptop and Desktop SVGs (wide aspect ratios) scale up to 1.55x and 1.45x so their visual mass in the 40px toolbar button is comparable to the squarer iPhone/iPad and Android glyphs at 1.15x.",
          "Match Notes map filtering now stays active while viewing or editing a single location, so closing or saving a note no longer resets the map back to an unfiltered view.",
          "Added roadmap ticket WISH-042 for a larger Smart Convert upgrade with richer parsing, Enter-to-convert behavior, and lightweight recognition popups.",
          "Notes filter summaries now use the same SVG symbols as the excluded and coordinate filter buttons instead of text-only glyphs.",
          "Quick Add now switches note context when the target location changes, so Locate uses the newly selected state instead of the previous location."
        ]
      },
      {
        version: "2.5.0",
        date: "2026-05-23",
        title: "Legend Gets Legs",
        summary: "A Legend-focused release that makes levels easier to edit, reorder, position, and scan.",
        highlights: [
          "Legend edit controls hide behind an Edit toggle; rows stay draggable to sort.",
          "Reorder Legend levels with steadier drag, drop slots, and live row feedback.",
          "Pick Legend position from a corner menu or drag its title between placements.",
          "Denser Legend: per-level stats in color ovals and total completion up top."
        ],
        banner: "A Legend-focused release that makes levels easier to edit, reorder, position, and scan.",
        cta: "Learn More",
        updates: [
          "Legend Edit reveals row controls only when needed, while levels stay draggable outside edit mode.",
          "Legend rows support right-to-left swipe quick actions for Edit/Delete with a far-right dismiss control that does not shift row alignment.",
          "Legend level sorting now uses a placeholder drop slot and commits order once on release, reducing row jitter while dragging.",
          "Legend row dragging captures the pointer immediately so click-and-move sorting is more reliable.",
          "Legend row sorting now uses pointer position against row midpoints for steadier drag-to-reorder behavior.",
          "Legend placement can be chosen from a desktop-only mini corner picker with full-size centered icons.",
          "Dragging the Legend title shows live placement previews across all desktop targets, including the current/original position with a blue outline.",
          "Legend placement preview now hides in the current corner, owns the candidate layout while dragging, and uses right-column row rules for top/bottom previews.",
          "Top-left and lower-left Legend placements now reserve real map-panel space so the map scrolls below them instead of sliding underneath.",
          "Right-side Legend placements give the Legend its natural height while Notes takes the scrollable space above or below it.",
          "The top Legend toggle now stashes the Legend under Notes before hiding it, so the panel does not vanish when you meant to move it out of the way.",
          "Per-level stats now live inside the color oval, while total completion sits directly under the Legend title.",
          "Legend stat ovals and total pills keep the user's tighter 24px height for denser rows.",
          "Level definitions are visible inline beside names in subtle text.",
          "Legend quick actions, row controls, and close buttons were centered and refined across icon/text button modes.",
          "Help Center, Release Notes, README, and Legend hints were refreshed for the post-2.3 map and Legend controls."
        ]
      },
      {
        version: "2.4.0",
        date: "2026-05-22",
        title: "Polish, Memory, and Mobile Flow",
        summary: "A cleanup release for saved layout state, Notes filtering and summaries, Location Tag settings, Roadmap counts, and What's New polish.",
        banner: "Saved map and Notes preferences, cleaner summaries, mobile polish, and a calmer What's New banner.",
        cta: "Learn More",
        highlights: [
          "Map view, zoom, pan, panels, Notes filters, and view prefs now persist.",
          "Denser Notes summaries: color-coded icons, compact filters, steadier filtering.",
          "More Icons now show in a 6-column grid on desktop and 3 columns on mobile.",
          "Polished What's New, hints, the H H shortcut, quad-tap reset, and Roadmap counts."
        ],
        updates: [
          "Map, Legend, and Notes visibility now restore across reloads.",
          "Map view mode, exact zoom level, scrollable-map pan center, and fit/scroll state now save to localStorage, export in JSON, import from backups, and restore on reload.",
          "Notes sort, view, category grouping, excluded visibility, level filters, icon filters, selected location, and collapsed note categories now persist.",
          "Condensed Notes now color the location-type icon by the highest visit level, show compact clipboard note counts, and avoid spending a separate column on level text.",
          "Notes summary now renders the location count with a compact view/sort/grouping bracket, then places active level/icon/search filters on their own smaller small-caps line.",
          "Notes search placeholder text is smaller, and long-press note icon filters are steadier on touch screens.",
          "Location Tag settings now show More Icons in a 6-column grid on wider screens and a 3-column grid on mobile.",
          "The tag-settings ellipsis shortcut gained a smaller ghost-style circular target.",
          "Mobile title-bar and map-control hints now sit above their controls, and the What's New banner can overlay the mobile toolbar.",
          "The What's New dismiss control uses a centered SVG close icon with a small desktop optical nudge.",
          "The hidden H H shortcut and app-name quad-tap now restore dismissed hints and the What's New banner highlight together.",
          "The title-bar Edit/Rename control now bottom-aligns with the map name for a cleaner header.",
          "Roadmap search now has a live count pill beside the search field that updates with search and filters.",
          "Roadmap filter drop-down options and the Roadmap search placeholder now include item counts, future target priorities were reorganized, and completed Legend roadmap items were retired."
        ]
      },
      {
        version: "2.3.0",
        date: "2026-05-21",
        title: "Map Goes Places",
        summary: "A map-focused release with scrollable pan/zoom, cleaner fit controls, better mobile header behavior, and sharper map-control shortcuts.",
        banner: "Scrollable pan and zoom, editable zoom percentages, cleaner fit controls, and a tighter map header.",
        cta: "Learn More",
        highlights: [
          "The State Map now opens in scrollable mode with pan-and-zoom controls available immediately.",
          "Zoom in 50% steps to 1000%, typed percentages, and pointer-anchored wheel zoom.",
          "Fit Map sits by the zoom controls with clearer mode symbols and tooltips.",
          "Tighter map header with grouped controls and cleaner screenshot behavior."
        ],
        updates: [
          "Zoom buttons preserve the current visible map center, while reset and initial scroll mode center the map cleanly.",
          "Dragging the scrollable map pans without accidentally marking a state after a pan.",
          "Map zoom, fit mode, and Text Size shortcuts work with the Shift-Control-Option overlay and Developer Shortcut Mode.",
          "Developer Mode now shows a compact version pill under the title bar name.",
          "Help Center and dismissible map hints were refreshed for scrollable map mode, typed zoom percentages, fit mode, and current header controls."
        ]
      },
      {
        version: "2.2.1",
        date: "2026-05-21",
        title: "Readable Road",
        summary: "A small patch release for the Text Size slider and readability tuning.",
        highlights: [
          "Settings now includes a compact iOS-style Text Size slider above Theme in Appearance.",
          "Text Size persists locally and scales the app without changing map zoom.",
          "The percentage rides inside a wider oval slider thumb, readable past 100%."
        ],
        updates: [
          "The Text Size slider fills edge to edge while keeping the value centered on the thumb.",
          "Help Center now mentions Text Size as separate from map zoom."
        ]
      },
      {
        version: "2.2.0",
        date: "2026-05-19",
        title: "Tag, You're It",
        summary: "Faster note entry, configurable icon tags, a bigger searchable icon catalog, and a resizable Notes workspace.",
        banner: "Faster notes, configurable icon tags, a resizable map/cards split, and a much bigger icon catalog.",
        cta: "Learn More",
        highlights: [
          "Notes can carry multiple icon labels, with keyboard toggles and a faster editor.",
          "New Location Icon Tags: choose, rename, reorder, shortcut, and search icons.",
          "More Icons auto-discovers every circle symbol with readable labels and tags.",
          "Notes add an icon-filter strip, an untagged filter, and clearer filter status."
        ],
        updates: [
          "The date picker was tightened for partial dates, with consistent controls for year-only, month-year, or full dates.",
          "Expanded and selected-location note rows now show multiple icons cleanly, align dates better, and open notes for editing from the row.",
          "Developer Tools now refreshes exported JSON as settings change, with large collections collapsed for easier inspection.",
          "Help Center and dismissible hints were refreshed for note tags, Smart Convert, icon filters, and map resizing."
        ]
      },
      {
        version: "2.1.0",
        date: "2026-05-17",
        title: "Notes Layout Polish",
        summary: "A focused Notes release with better scanning, sticky groups, clearer hierarchy, and cleaner copy-ready text.",
        banner: "Sticky groups, cleaner columns, clearer hierarchy, and better copy-ready notes.",
        cta: "Learn More",
        highlights: [
          "Notes search now stretches across the header and aligns with the Notes title.",
          "Categorical headers stick while scrolling and show counts before the chevron.",
          "Condensed rows use balanced 40/20/20/20 columns for faster scanning.",
          "Expanded Notes now has clearer hierarchy between category, location, and note rows."
        ],
        updates: [
          "Expanded location rows now nudge the icon/name inward and add a wider icon-to-name gap.",
          "Expanded note rows now align the visit icon more evenly between the row edge and date.",
          "Text Only output keeps single-note locations on one line, uses a deeper indent for multi-note details, and switches to SF Pro Rounded.",
          "Help Center and Notes guidance were refreshed for the polished Notes layout.",
          "Roadmap gained future follow-up items for text sizing and Legend layout."
        ]
      },
      {
        version: "2.0.0",
        date: "2026-05-16",
        title: "Major Notes Upgrade",
        summary: "Richer visit notes, smarter search and views, release notifications, and a more copy-ready notes workflow.",
        banner: "Richer visit notes, better sorting, grouped locations, and copy-ready text.",
        cta: "Learn More",
        highlights: [
          "Notes support structured fields: where, what, who, details, dates, and levels.",
          "New Notes views: Chronological, Alphabetical, Categorical, Expanded, and Text.",
          "Text exports are easier to copy; JSON backups stay lean and restore the map.",
          "Returning users can see a What's New banner and update dots for major feature releases."
        ],
        updates: [
          "Smart Convert can turn a quick note into structured note fields, remove parsed pieces from the remaining details, and clear itself after parsing.",
          "Legend stats count each location toward its highest active level, and excluded only locations can be shown or hidden in Notes.",
          "Selected locations open into Notes with tighter Applied Levels and Visit Notes sections.",
          "Developer Tools gained banner reset, shortcut mode, and defaults reset controls for maintenance.",
          "Help Center coverage and dismissible hints were refreshed for the 2.0 notes workflow."
        ]
      },
      {
        version: "1.13.0",
        date: "2026-05-16",
        title: "Release Notes, Help, and Shortcut Polish",
        summary: "A focused release for faster release-note access, a clearer Help Center, tighter map controls, cleaner roadmap defaults, and more useful Developer Tools.",
        highlights: [
          "Help Center refreshed for map, legend, notes, dates, exports, hints, and keys.",
          "What's New and Help Center sections gained custom icons and tighter, cleaner spacing.",
          "State Map header controls are shorter, and mobile map buttons split into label and render groups.",
          "Roadmap now sorts by Priority by default."
        ],
        updates: [
          "Changed Rename to shortcut M so R can own the Release Notes and Roadmap search flow.",
          "Added Release Notes and Roadmap section ids for keyboard navigation, scroll targeting, and focus management.",
          "Improved Roadmap search focus spacing, Release Notes/Roadmap separator spacing, and release note card spacing.",
          "Expanded Help Center documentation and FAQ coverage for the latest interaction model.",
          "Preserved and documented the Settings close-button spacing and custom section icon polish.",
          "Added WISH-023 for a future tip jar/support option."
        ]
      },
      {
        version: "1.12.0",
        date: "2026-05-16",
        title: "Developer Mode and Map Label Tuning",
        summary: "A hidden Developer Tools mode with one-key Shortcut Mode and a drag-to-position map label tool, plus simpler hardcoded label positions, suggestions on by default, and a notes-panel detail fix.",
        highlights: [
          "Added a hidden Developer Tools.",
          "Developer Mode adds one-key Shortcut Mode and drag-to-position map labels.",
          "Map labels use bounding-box center plus easy per-state dx/dy nudges.",
          "Suggested legend categories are now visible by default for new users."
        ],
        updates: [
          "Added persisted developerMode and shortcutMode settings with safe migration; Shortcut Mode requires Developer Mode.",
          "Added a Developer Tools tab with a secret toggle to enter/exit Developer Mode.",
          "Added pointer-driven drag handlers on SVG label text in Developer Mode, with SVG-coordinate conversion and a fixed centered readout that updates live during drag.",
          "Removed the runtime polygon-centroid label cache; label positions are now bounding-box center plus dx/dy or absolute x/y overrides.",
          "Added an id=\"notesPanelSubtitle\" element so renderNotesPanel can set the per-state subtitle without throwing on null, restoring the Applied Levels and Visit Notes content.",
          "Flipped the hideSuggestedCategories default from true to false in defaultState and normalizeState's fallback.",
          "Added Target and Effort options to the Roadmap sort list and forced Roadmap controls and result cards to stretch and left-align.",
          "Removed completed roadmap ticket WISH-005 from seeded data and completion-filtered it from existing local data."
        ]
      },
      {
        version: "1.11.0",
        date: "2026-05-16",
        title: "Hints, Legend, and Mobile Polish",
        summary: "A focused refinement release for dismissible guidance, cleaner legend controls, mobile Settings fit, and screenshot-friendly map behavior.",
        highlights: [
          "Hints are now individually dismissible, while the global Hints setting still controls the full set.",
          "Focused helper text across Map, Notes, Legend, Smart Colors, exports, and Settings.",
          "Legend adds hidden suggested categories, clearer Auto Colors, and aligned stats.",
          "The map opens in fit-to-screen mode by default and keeps header controls right aligned."
        ],
        updates: [
          "Added persistent per-hint dismissal using localStorage state migration and the ICON_GLOBAL_DISMISS__X_CIRCLE_FILL control.",
          "Made the Hints setting override individual dismissals by clearing per-hint state whenever it changes.",
          "Combined map-control guidance into one dismissible hint under the controls and kept Notes hint dismissal stable across view changes.",
          "Added helper text for level autosave, Exclude from Stats, Smart Colors palette order, JSON/text exports, flexible note dates, and Settings Hints behavior.",
          "Added a persistent Hide Suggestions toggle between Auto Colors and Add Level; suggested category chips default to hidden.",
          "Updated the Suggestions toggle so blue means suggested categories are visible.",
          "Aligned legend header stats and per-level stat pills on a shared stat lane with separate spacer and action lanes.",
          "Changed the default map viewport mode from scrollable to fit-to-screen and right-justified the State Map header controls.",
          "Constrained Settings to the visible viewport on phones, tightened tabs/rows/exports, and isolated Settings from global Icon + Text stacking.",
          "Added roadmap ticket WISH-020 for the Settings close button spacing.",
          "Added roadmap ticket WISH-021 for improved structured notes, note delete button polish, visit-type icons, and better exports.",
          "Added roadmap ticket WISH-022 for centering state labels on actual state shapes instead of bounding boxes."
        ]
      },
      {
        version: "1.10.0",
        date: "2026-05-16",
        title: "Visitor's Center",
        summary: "The app got a new name, a new layout, four ways out, and a Help Center that actually helps.",
        highlights: [
          `Visit Tracker. That's the name now.`,
          "Settings, Help Center, and What's New are a top navigation bar — always visible, never buried.",
          "App name and version live in a tidy footer pill at the bottom of the panel.",
          "Four export formats: JSON, Markdown, Rich Text, and Simple Text."
        ],
        updates: [
          "Import and Export controls compacted: no nested card, buttons stretch to fill the row equally and always show icon and text.",
          "Roadmap filters expanded with Target and Effort; order is now Category, Priority, Target, Effort in both the filter row and each card.",
          "'Bucket' removed from roadmap target labels.",
          "Roadmap search, filters, and sort controls float sticky below the Roadmap header while scrolling.",
          "Settings close button now has the X icon and label like all other dialogs.",
          "Send Feedback added to Help Center. IYKYK."
        ],
        updates: [
          "Reduced Settings section gaps, card padding, and mobile spacing for a tighter panel.",
          "Adjusted parent category headings to use stronger sizing and weight than row-level labels.",
          "Trimmed Settings segmented-control spacing, padding, and row height so option groups use less vertical space.",
          "Gave Settings icons a little more vertical drawing room so SF symbols do not clip inside compact buttons.",
          "Widened the map-label Name icon canvas so the Aa symbol reads at the right size without a tight right edge.",
          "Adjusted the Notes A-Z icon canvas so the sort control looks less cramped.",
          "Removed competing scroll containers from Settings so the dialog body owns scrolling cleanly.",
          "Reserved stable height for the Settings tab strip so tab controls do not collapse into the panel content.",
          "Reset Settings dialog scroll on open and tab changes so the tab row starts visible.",
          "Retired the completed Settings double-scroll roadmap item from seeded roadmap data.",
          "Tightened Import and Export copy, actions, and file input spacing to match the denser Settings rhythm."
        ]
      },
      {
        version: "1.9.0",
        date: "2026-05-14",
        title: "Roadmap Pit Crew",
        summary: "Made roadmap planning, release notes, map controls, and notes scrolling easier to scan without losing detail.",
        highlights: [
          "Roadmap grew with icon-alignment and SF Symbol conversion work.",
          "Release notes now separate quick highlights from full updates.",
          "Map controls now use clearer neutral affordances and grouping.",
          "Main-view scrolling and notes sizing are stable on desktop."
        ],
        updates: [
          "Added roadmap planning for polishing the A-Z sort icon alignment across button-style modes and compact widths.",
          "Added roadmap planning for a local SF Symbol conversion workflow with naming normalization, hidden-rect cleanup, previews or diffs, and artwork-change guardrails.",
          "Changed changelog rendering to show a Highlights section and a Full Update List section for each release.",
          "Locked the desktop main view to the viewport so the page itself no longer vertically scrolls.",
          "Sized the map column from available height and returned unused width to the Legend and Notes rail.",
          "Made Notes panel content scroll internally so its bottom aligns with the map container.",
          "Applied fixed height to condensed note rows to prevent vertical stretching.",
          "Updated Notes panel content so it fills the rail as the scroll container without stretching its children.",
          "Locked compact and expanded note rows to max-content grid tracks so they keep their natural item sizes.",
          "Preserved the manual condensed-row sizing refinements while tightening the scroll behavior.",
          "Kept the Map Fit control visually neutral while it swaps between fit and scroll symbols.",
          "Restyled the Labels tag as a subtly shaded edge-to-edge category title so it no longer looks selected or selectable.",
          "Made the Labels category icon more prominent in symbol-only controls.",
          "Added a subtle hover border and shade to inactive label options.",
          "Added a hover tooltip that identifies the Labels category as Map Label Type.",
          "Added hover tooltips for toggling the Legend and Notes panels.",
          "Kept the refined label-control shading and spacing while tightening the main layout.",
          "Standardized local smoke testing on port 8018 and cleanup after checks.",
          "Improved release-note upkeep so preserved refinements are captured alongside active updates.",
          "Kept release entries on the collapsed major/minor format while allowing fuller release detail.",
          "Split late-cycle polish into a separate 1.9 release line for clearer release history.",
          "Aligned the local roadmap and release-note guidance with the new structure."
        ]
      },
      {
        version: "1.8.0",
        date: "2026-05-14",
        title: "Icon Tailor Shop",
        summary: "Polished Settings, dialogs, labels, SF-style iconography, and display order.",
        highlights: [
          "Settings and dialog actions feel tighter.",
          "Iconography and date display controls got cleaned up."
        ],
        updates: [
          "Standardized icons across Settings, Notes, Legend, sorting, editing, moving, deleting, and labels.",
          "Moved note saving into the dialog header and simplified dialog actions.",
          "Reworked Settings into tighter aligned category rows.",
          "Made the map Labels control read more like a category title.",
          "Moved Alphabetical before Numerical in Settings date display controls."
        ]
      },
      {
        version: "1.7.0",
        date: "2026-05-11",
        title: "Counting What Counts",
        summary: "Added explicit stat behavior and visual treatment for legend levels.",
        highlights: [
          "Legend levels can opt out of completion totals.",
          "Stats now make counted and uncounted progress clearer."
        ],
        updates: [
          "Added per-level control for whether a level counts toward stats.",
          "Added non-counting level styling and quick-add options.",
          "Moved total completion into the Legend header.",
          "Kept excluded levels visible on the map while excluding them from completion math."
        ]
      },
      {
        version: "1.6.0",
        date: "2026-05-11",
        title: "Pocket Map Mode",
        summary: "Improved mobile map viewing and small-screen density.",
        highlights: [
          "Mobile map viewing got easier.",
          "Small-screen legend layout got tighter."
        ],
        updates: [
          "Added fit-to-screen map mode.",
          "Refined map fit controls and mobile header behavior.",
          "Tightened mobile legend layout and stat placement.",
          "Kept map controls accessible while reducing wasted mobile space."
        ]
      },
      {
        version: "1.5.0",
        date: "2026-05-11",
        title: "Labels, Lands, And Little Islands",
        summary: "Expanded the map and made labels and notes easier to scan.",
        highlights: [
          "DC and US territories joined the map.",
          "Labels and notes became easier to scan."
        ],
        updates: [
          "Added Washington, DC and US territories.",
          "Added map label modes for none, abbreviation, and name.",
          "Improved territory placement and label wrapping.",
          "Refined map tap behavior for already-marked regions.",
          "Added note search and tightened compact note density."
        ]
      },
      {
        version: "1.4.0",
        date: "2026-05-11",
        title: "Control Room Renovation",
        summary: "Reworked the main interface around notes, shortcuts, exports, and flexible dates.",
        highlights: [
          "Controls moved closer to the map.",
          "Notes and dates became more flexible."
        ],
        updates: [
          "Added button styles, UI hints, shortcut overlay, and broader keyboard coverage.",
          "Moved Legend and Notes controls into the map header and import/export into Settings.",
          "Added note sorting, compact notes, and level filters.",
          "Added year-only, month-year, and full-date note entry.",
          "Added configurable date display and clearer date format examples.",
          "Moved destructive browser prompts into app-owned confirmation dialogs."
        ]
      },
      {
        version: "1.3.0",
        date: "2026-05-10",
        title: "Drawer Drama, Resolved",
        summary: "Polished state selection, stats, and destructive actions.",
        highlights: [
          "State selection became more direct.",
          "Destructive actions became safer and clearer."
        ],
        updates: [
          "Moved summary stats into the map header and made the legend panel match the map height.",
          "Added map-positioned selection and marked-state navigation.",
          "Replaced native browser dialogs with reliable in-app confirmations.",
          "Added compact controls for editing legend rows.",
          "Improved the drawer flow for moving between marked states."
        ]
      },
      {
        version: "1.2.0",
        date: "2026-05-10",
        title: "Legend Has It",
        summary: "Made visit levels easier to order, color, and understand.",
        highlights: [
          "Legend order now controls map color priority.",
          "Color picking became clearer."
        ],
        updates: [
          "Legend levels can be reordered, with the top level determining the map color.",
          "Improved color selection and generated palettes.",
          "Made state selection consistent across tap modes.",
          "Improved generated themes so palettes progress more predictably from high to low.",
          "Kept level editing compact enough for repeated use."
        ]
      },
      {
        version: "1.1.0",
        date: "2026-05-10",
        title: "Real Map Energy",
        summary: "Upgraded the tracker from a grid into a richer map experience.",
        highlights: [
          "The grid became a real state-outline map.",
          "Visit tracking gained multi-level detail."
        ],
        updates: [
          "Replaced the tile grid with a real state-outline map.",
          "Added multiple applied levels and level-linked notes per state.",
          "Added completion stats and smart color palettes.",
          "Added map-aware state selection and richer state-level data storage.",
          "Kept the app local-only while expanding the interaction model."
        ]
      },
      {
        version: "1.0.0",
        date: "2026-05-10",
        title: "First Pin On The Map",
        summary: "Launched the offline state visit tracker.",
        highlights: [
          "Launched the core offline tracker.",
          "Added the first import/export and note workflows."
        ],
        updates: [
          "Added interactive visit tracking for the 50 states.",
          "Added custom levels, colors, dated notes, settings, and import/export.",
          "Kept the app as a single-file local-only experience.",
          "Stored user data in browser localStorage.",
          "Included enough controls to rename maps, adjust levels, and preserve backups."
        ]
      }
    ];
