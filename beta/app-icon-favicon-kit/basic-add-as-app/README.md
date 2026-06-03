# Basic Add As App Drop-In

Fastest path:

1. Copy this `basic-add-as-app/` directory into your app.
2. Replace:
   - `icons/app-icon-light.svg`
   - `icons/app-icon-dark.svg`
3. Paste this near the top of your page `<head>`:

```html
<script
  src="basic-add-as-app/add-as-app.js"
  data-app-name="My App"
  data-app-short-name="My App"
  data-app-description="A short app description."
  data-theme-light="#f6f7f9"
  data-theme-dark="#101318"></script>
```

That is the basic setup. The script injects:

- SVG favicon
- Apple touch icon link
- generated web app manifest
- mobile web app meta tags
- light/dark theme-color meta tags
- optional install button behavior

## Optional Install Button

Add this anywhere in your app:

```html
<button type="button" data-add-as-app-install>Add as App</button>
```

Chrome/Edge will show the install prompt when available. Safari does not expose
a programmatic install prompt, so the button returns fallback instructions via
`window.AddAsApp.install()`.

## Optional Icon Toggle

Add buttons like this if you want the user to pick an icon:

```html
<button type="button" data-add-as-app-icon="light">Light icon</button>
<button type="button" data-add-as-app-icon="dark">Dark icon</button>
<button type="button" data-add-as-app-icon="auto">Auto</button>
```

The choice is stored in `localStorage`.

## Common Customizations

```html
<script
  src="basic-add-as-app/add-as-app.js"
  data-app-name="Trail Notes"
  data-app-short-name="Notes"
  data-app-description="A local-first notes app."
  data-theme-light="#ffffff"
  data-theme-dark="#111827"
  data-icon-light="icons/app-icon-light.svg"
  data-icon-dark="icons/app-icon-dark.svg"
  data-storage-key="trailNotesIconMode"
  data-start-url="./"
  data-display="standalone"></script>
```

Paths are resolved relative to `add-as-app.js`, so the default icon paths work
as long as the directory is copied intact.

## Tiny Caveat

This basic version is intentionally SVG-only and uses a generated in-memory
manifest. That is enough for many small apps. For the most reliable iOS/Safari
home-screen icon behavior, use the full kit one level up to generate committed
PNG icons and static manifest files.
