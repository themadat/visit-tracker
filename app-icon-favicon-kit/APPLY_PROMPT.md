# Copyable Apply Prompt

Use this prompt in another app when you want an LLM or future Codex thread to
apply the kit quickly:

```text
Apply the app icon and favicon setup from app-icon-favicon-kit to this web app.

Use the kit's README first. Preserve the app's existing behavior and avoid a
build system unless one already exists. Add light/dark source SVG icons, the
generate-icons.sh and generate-favicon.py scripts, light/dark web manifests,
the early head link script, theme-color metadata, and optional install-icon
switching UI if the app has an install/help/settings surface.

Customize app name, short name, theme colors, localStorage key, icon paths, and
manifest fields for this app. Generated output should include apple-touch icon
PNGs, 16/32 favicon PNG fallbacks, 192/512 manifest PNGs, and a dual-theme
favicon.svg. Verify paths, run the generator when possible, and summarize where
the target app should place the generated assets.
```

## Scope Guardrails

- Do not replace unrelated app metadata.
- Do not add network dependencies.
- Do not remove existing icons until the new files and links are verified.
- Keep paths simple unless the app has an established public asset directory.
- If the app already has a PWA manifest, merge fields rather than overwriting
  unrelated app-specific settings.
