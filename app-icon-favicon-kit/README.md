# App Icon and Favicon Kit

Reusable app-icon, favicon, and web-app manifest setup extracted from Trail Log.
The kit is meant to be copied into another small web app and customized in a few
minutes.

## Want The Smallest Version?

Use `basic-add-as-app/` if you only want to supply a light SVG, a dark SVG, and
paste one script tag into the next app. It injects the Add as App metadata,
favicon, Apple touch icon, and a generated manifest at runtime.

## What This Gives You

- Light and dark source SVG app icons.
- A macOS icon build script that generates:
  - `apple-touch-icon.png`
  - `apple-touch-icon-dark.png`
  - `icon-192.png`
  - `icon-512.png`
  - `icon-192-dark.png`
  - `icon-512-dark.png`
  - `favicon-16.png`
  - `favicon-32.png`
  - `favicon-16-dark.png`
  - `favicon-32-dark.png`
  - `favicon.svg`
- A dual-theme SVG favicon using `prefers-color-scheme`.
- Light and dark PWA manifest templates.
- A head snippet that sets favicon, manifest, and Apple touch icon links before
  the browser fetches them.
- Optional UI snippets for letting a user pick the light or dark install icon.

## Directory Layout

```text
app-icon-favicon-kit/
  README.md
  APPLY_PROMPT.md
  build/
    generate-icons.sh
    generate-favicon.py
  icon/
    app-icon-light.svg
    app-icon-dark.svg
  templates/
    head-links.html
    manifest.webmanifest
    manifest-dark.webmanifest
    install-icon-picker.html
    install-icon-switcher.css
    install-icon-switcher.js
```

## Quick Apply To Another App

1. Copy `build/`, `icon/`, and the manifest templates into the target app root.

2. Replace the example SVGs:

```text
icon/app-icon-light.svg
icon/app-icon-dark.svg
```

The two SVGs should have the same geometry and the same number/order of
`fill="#RRGGBB"` attributes. The colors can differ. That is how
`build/generate-favicon.py` turns them into one theme-aware `favicon.svg`.

3. Edit the manifest templates:

```text
manifest.webmanifest
manifest-dark.webmanifest
```

Set `name`, `short_name`, `background_color`, and `theme_color`.

4. Add the contents of `templates/head-links.html` near the top of your
document `<head>`, before other icon links.

Change:

- `App Name`
- `appInstallIconVariant`
- `theme-color`
- `description`
- any asset paths if your app is not served from the same directory as
  `index.html`

5. Generate assets from the target app root:

```sh
./build/generate-icons.sh
```

This uses `qlmanage`, which ships with macOS, and Python 3 for the SVG favicon.

If QuickLook hangs, reset it and rerun:

```sh
killall -9 QuickLookUIService quicklookd
./build/generate-icons.sh
```

6. Optional: add the install-icon picker.

Copy the markup from `templates/install-icon-picker.html`, the CSS from
`templates/install-icon-switcher.css`, and the JS from
`templates/install-icon-switcher.js`. The picker updates:

- `apple-touch-icon`
- `manifest`
- 16px and 32px PNG favicons
- the stored icon preference in `localStorage`

For Safari on Mac, reload after switching the install icon before using
Add to Dock. Safari snapshots the install metadata early in page load.

## HTML Head Pattern

Minimum pattern:

```html
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<script>
  // Add apple-touch-icon, manifest, and PNG favicon links early.
</script>
<meta name="apple-mobile-web-app-title" content="App Name">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="theme-color" content="#f6f7f9" media="(prefers-color-scheme: light)">
<meta name="theme-color" content="#101318" media="(prefers-color-scheme: dark)">
```

Use the full version in `templates/head-links.html` so the selected light/dark
variant is applied before Safari or Chromium fetches install metadata.

## Verification Checklist

- `favicon.svg` opens in the browser and changes under dark-mode simulation.
- `favicon-16*.png` and `favicon-32*.png` are legible at tiny sizes.
- `apple-touch-icon*.png` look good at 180x180 with rounded OS masking.
- `icon-192*.png` and `icon-512*.png` are listed in the matching manifests.
- The page has exactly one SVG favicon link and one selected PNG 16/32 fallback.
- The selected manifest changes when the optional picker switches variants.
- Safari Add to Dock uses the selected icon after a reload.

## Notes

- Keep the generated PNGs and `favicon.svg` committed with the app.
- Keep the source SVGs committed too. They are the editable source of truth.
- The generated files are intentionally plain root-level assets because browsers
  and install flows tend to be less surprising with simple relative paths.
