# WISH-075 — Show a Pack Photo's Camera Location (target 4.7.3)

Ticket: **WISH-075** "Show a Pack Photo's Camera Location". Target: **4.7.3**. Online-only, lazy, read-only — surfaces where a Waypoint-pack photo was **taken from** (the camera/vantage point), distinct from the landmark's own coordinates, so a traveler can stand in the same spot and recreate the shot. **Never touches the note's stored lat/lng.**

## Goal

When a pack photo is shown, fetch and display the photo's **camera location** (and heading when available) from Wikimedia Commons, plus the **offset from the note's landmark** (distance + bearing), with a **tap-to-open map pin** at the camera spot. Show it **under the photo in both places the photo appears** (note editor + Waypoint Packs panel). When no camera location exists, **show an explicit, subtle "unavailable" state** (not nothing) so it never reads as a bug/missing feature.

## Current photo flow (what we build on)

- `toggleWaypointPhotoPreview(setId,itemId)` (`index.html` ≈7395) resolves a photo URL into `waypointPhotoUrlCache` (Map, in-memory): either `item.photoUrl` (a direct Commons upload URL) or, via `wikipediaPageImageEndpoint(item.wikiPage)` (≈7382), the en.wikipedia **pageimages** thumbnail (`page.thumbnail.source`, also a Commons upload URL).
- The photo renders in two surfaces: the note editor (`refreshNoteWaypointControls` → `#noteWaypointPhotoPreview`, ≈10650/10696) and the Waypoint Packs panel preview (`waypointPhotoPreviewHtml` / `renderSetsDialog`, ≈7428). Both read from `waypointPhotoUrlCache`; loading state via `waypointPhotoLoadingKeys`.
- So every shown photo resolves to a **Commons upload URL** → we can derive the **Commons File name** and query its camera metadata.

## Data path (camera location)

1. **Get the Commons File name.** From the resolved photo URL: a direct URL is `…/wikipedia/commons/7/76/<File>.jpg`; a thumb URL is `…/commons/thumb/7/76/<File>.jpg/1200px-<File>.jpg` → take the segment after `/commons/(thumb/)?x/yy/` (decode). Cleaner where available: extend the pageimages query with `piprop=thumbnail|name` so the API returns `pageimage` (the file title) directly; fall back to URL parsing for `item.photoUrl` items.
2. **Query Commons** (CORS-friendly, `origin=*`), one request:
   `https://commons.wikimedia.org/w/api.php?action=query&format=json&origin=*&prop=coordinates|imageinfo&coprop=type|name|globe&coprimary=all&iiprop=extmetadata&titles=File:<name>`
3. **Parse, in priority order:**
   - `query.pages[*].coordinates[]` entry whose `type` is `camera` → the `{{Camera location}}` lat/lon (preferred).
   - else `imageinfo[0].extmetadata.GPSLatitude` / `GPSLongitude` (EXIF camera GPS).
   - **Heading**: `extmetadata.GPSImgDirection` (degrees) when present → compass point.
   - If none → **no camera location**; show the explicit unavailable state (don't fall back to the object/landmark coordinate — that's already the note's location).
4. **Cache** results in a new in-memory `waypointCameraLocationCache` (keyed by file name or the photo key), mirroring `waypointPhotoUrlCache`. **No persistence / no schema change** — it's derived online, online-only.

## Behavior / UX

- **Readout** under the photo frame in both surfaces, e.g.:
  `📷 Taken from 44.2217°, −68.3373° · facing NE · ~150 m SW of the site`
  - **Camera coords** (formatted to ~4 dp).
  - **Heading** ("facing NE") only when EXIF `GPSImgDirection` exists (8-point compass from degrees; honor `GPSImgDirectionRef` if simple).
  - **Offset from landmark** (chosen option): haversine distance + initial-bearing compass label between the note's landmark coords (`validNoteCoordinates(note)`) and the camera coords. Skip the offset if the note has no coords. Use the app's existing unit sense (Rangefinder `ringUnit` mi/km → m·km or ft·mi); confirm formatting at `start`.
  - **Tap-to-open = map pin** at the camera coords: `https://www.google.com/maps/search/?api=1&query=<lat>,<lng>` (new tab, `rel="noopener"`), matching how Locate/photo previews are intentional online actions.
- **Lazy + online-only**: only fetch when a photo is opened (same trigger as the image fetch); never auto-fetch. The caption area has three explicit states so it never looks broken:
  - **Checking** (request in flight): a muted "Checking camera location…" placeholder (the photo can render before the readout resolves).
  - **Found**: the readout above.
  - **Unavailable** (no camera geotag) / **offline or fetch error**: a muted, small **explicit empty state** in the same slot — e.g. "📷 No camera location on file" (and a distinct "Couldn't check — offline?" for a failed request if worth distinguishing) — with a subtle muted style, no error popup. The key point: a missing camera location is communicated, not silently dropped.
- **Read-only**: never write to `note.lat/lng` or any stored field.
- **Read-only**: never write to `note.lat/lng` or any stored field.

## Schema / data

- **No persisted schema change.** New in-memory cache only. (No `defaultState`/`normalizeState` work.)
- New helpers (JS): `commonsFileNameFromUrl(url)`, `commonsCameraLocationEndpoint(file)`, `fetchWaypointCameraLocation(key, file)` (cache-aware), `formatCompass(deg)`, `offsetFromLandmark(noteCoords, cameraCoords)` (reuse any existing haversine/bearing; Rangefinder already does distance math — check `milesToSvgScale`/ring helpers for a reusable haversine).

## Implementation phases (for `start`)

1. Open `4.7.3.1`, CHANGELOG entry (patch), bump `APP_VERSION`.
2. File-name derivation (URL parse + pageimages `piprop=…|name`); `commonsCameraLocationEndpoint`.
3. `fetchWaypointCameraLocation` + `waypointCameraLocationCache`; hook into the photo-open flow (after the image resolves), refresh consumers when it returns.
4. Compass + offset helpers (distance/bearing vs landmark).
5. Render the caption under the photo in **both** surfaces (`#noteWaypointPhotoPreview` render + `waypointPhotoPreviewHtml`/packs panel) with its three states (checking / found-with-map-pin-link / explicit unavailable).
6. CSS: small, subordinate caption styling (theme-aware) with a muted variant for the checking/unavailable empty states, mobile-friendly.
7. Surfaces: Help/FAQ note (online action), README, handoff. Mark WISH-075 done at `ship`.
8. Verify (parse + desktop/mobile smoke on 8018 with a known camera-geotagged photo and one without).

## Open questions / risks

- **Coverage**: many Commons photos have **no** camera location (no `{{Camera location}}`, no EXIF GPS) — the feature is best-effort and will frequently land in the "unavailable" state. That's expected; the explicit empty state keeps it from looking broken. Keep the unavailable copy gentle/non-alarming.
- **Commons API shape / CORS**: confirm `origin=*` works for commons.wikimedia.org and the `coordinates`+`imageinfo` combo returns what we expect; EXIF `GPSLatitude` formatting varies (decimal vs DMS string) — normalize.
- **Heading availability**: `GPSImgDirection` is rarer than GPS position; heading is a when-present bonus.
- **Units for the offset**: align with the app's mi/km handling; pick m/km vs ft/mi.
- **Extra request per photo**: one more lazy fetch when a photo opens — fine; cache to avoid repeats; never batch/preload.
- **Two render surfaces** must both show the readout and share the cache/loading state.

## Verify (at `start`/`prep`)

- Open a pack photo known to have a camera location (find one with `{{Camera location}}` on Commons) in the note editor: readout shows camera coords, heading when present, and offset from the landmark; the map-pin link opens the right spot; note's own lat/lng unchanged.
- Same photo in the Waypoint Packs panel preview shows the same readout.
- A photo without a camera geotag shows the image plus an explicit muted "no camera location on file" state (not a blank gap) and no error popup.
- Offline / fetch failure: image behavior unchanged; the caption shows a muted "couldn't check" state rather than disappearing.
- While the camera request is in flight, a muted "checking…" placeholder shows, then resolves to found/unavailable.
- `./build/check.sh`, `git diff --check`, desktop + mobile (375px) on port 8018; both themes.
