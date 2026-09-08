# Data Sync — Cloud Trail

## Resume

Implementation complete at **5.0.0.2 Cloud Trail**, pending user checkpoint/release workflow. Only visit-tracker was edited; pre-existing `.vscode/settings.json` work is preserved. Latest cut release is still 5.0.0.

- Done: template sync engine/status icons; leftmost top-bar local/cloud status; Settings → Data Sync setup, Test/Save/Forget, explicit Sync Now, cloud restore, initial/conflict choices, conservative merge, recovery restore/export and JSON preview.
- Compatibility: content-only Trail Log envelope, pinned target, device/tab tokens outside app state, existing `usStateVisitMap.v1`/full backups unchanged. Sparse quick-select notes canonicalize; pack-icon mapping follows managed note metadata. Local appearance/legend colors/general tag settings remain local. Pending Basecamp edits flush before user sync actions.
- Safety: GitHub SHA checks; verified missing targets; 5 MB size limit with raw reads and revision verification above GitHub’s inline-content threshold; no local replacement before successful recovery and persistence; stale local edits during choices require a new comparison.
- Verified: `./build/check.sh`, `git diff --check`, **24 Node tests**, **23 real-app browser integration assertions** with memory storage/simulated GitHub. Browser checks include actual normalization, custom Waypoint icons, rich-text sanitization, partial dates, coordinates, linked pads, restored rendering, masked token setup, cancellation and conflict choices. All nine toolbar actions fit 390 px; 1256×900 desktop remains exactly viewport-height.
- Files: `index.html`, `assets/css/app.css`, `assets/js/sync*.js`, `assets/js/changelog.js`, README/handoff, `tests/sync.test.mjs`, and isolated `tests/sync-browser.{html,js}`.
- No real GitHub token was read/configured and no real cloud data was changed. To connect, use Settings → Data Sync on each device. Preview server stopped at handoff.
- Deployment follow-up (5.0.0.2): shared Pages queue fixes cross-channel publishing races; versioned workflow name and commit-based run titles follow app-template. Roll the workflow fix into all channels before overlapping deployments.
- Next: user checkpoint; `prep`/`ship` if requested. No implementation blockers.

## Scope

Port the template GitHub Contents API flow and fourteen cloud states. Place the combined local/cloud action first in the top-bar toolbar. Add Settings → Data Sync with the fixed themadat/app-data/main/data/visit-tracker.json target, masked per-device/tab token, test/save/forget, Sync Now, confirmed Restore from Cloud, recovery and compact JSON preview.

Sync saved map name, legend definitions, pack-icon mappings needed by managed notes, US/World levels and notes, and Basecamp pads/links. Device preferences, legend colors, tag configuration, UI state, credentials and generated metadata stay local. Existing usStateVisitMap.v1 data and manual backups remain compatible. Sync metadata/token/recovery use dedicated Trail Log local keys.

Use content baselines and GitHub SHA checks. Initial/conflicting copies require choices; merge only matching/separate items and never choose by timestamp. Recovery must succeed before replacing local content. Background checks are read-only, like the template; actual transfer uses Sync Now.

## Verify

Parse all scripts; dependency-free tests for content isolation, validation, first sync, conflict and merge, authentication, offline, SHA races, recovery failures and edits during an upload/choice. Preview desktop/mobile and token/settings/JSON/confirmation controls on port 8018 with isolated test storage. Stop the server before handoff.
