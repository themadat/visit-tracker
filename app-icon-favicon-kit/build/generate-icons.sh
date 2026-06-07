#!/usr/bin/env bash
#
# Generate web app icons from a light/dark SVG pair.
#
# Expected default layout when copied into an app:
#   build/generate-icons.sh
#   build/generate-favicon.py
#   icon/app-icon-light.svg
#   icon/app-icon-dark.svg
#
# Outputs to the app root by default:
#   apple-touch-icon.png
#   apple-touch-icon-dark.png
#   icon-192.png
#   icon-512.png
#   icon-192-dark.png
#   icon-512-dark.png
#   favicon-16.png
#   favicon-32.png
#   favicon-16-dark.png
#   favicon-32-dark.png
#   favicon.svg
#
# Usage:
#   ./build/generate-icons.sh
#   ./build/generate-icons.sh /path/to/app-root
#
# Optional environment overrides:
#   APP_ICON_LIGHT_SVG=/path/to/light.svg
#   APP_ICON_DARK_SVG=/path/to/dark.svg
#   APP_ICON_OUTPUT_DIR=/path/to/output

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEFAULT_APP_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
APP_ROOT="${1:-$DEFAULT_APP_ROOT}"
APP_ROOT="$(cd "$APP_ROOT" && pwd)"
OUTPUT_DIR="${APP_ICON_OUTPUT_DIR:-$APP_ROOT}"
OUTPUT_DIR="$(mkdir -p "$OUTPUT_DIR" && cd "$OUTPUT_DIR" && pwd)"

LIGHT_SVG="${APP_ICON_LIGHT_SVG:-$APP_ROOT/icon/app-icon-light.svg}"
DARK_SVG="${APP_ICON_DARK_SVG:-$APP_ROOT/icon/app-icon-dark.svg}"

if ! command -v qlmanage >/dev/null 2>&1; then
  echo "Error: qlmanage not found. This script needs macOS." >&2
  exit 1
fi

for svg in "$LIGHT_SVG" "$DARK_SVG"; do
  if [ ! -f "$svg" ]; then
    echo "Error: missing source SVG: $svg" >&2
    exit 1
  fi
done

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

render() {
  local src="$1"
  local size="$2"
  local dest_name="$3"
  local out_dir="$TMP/out"
  rm -rf "$out_dir"
  mkdir -p "$out_dir"

  qlmanage -t -s "$size" -o "$out_dir" "$src" >/dev/null 2>&1 &
  local pid=$!
  local generated="$out_dir/$(basename "$src").png"
  local waited=0

  while [ ! -f "$generated" ] && [ "$waited" -lt 20 ]; do
    sleep 1
    waited=$((waited + 1))
  done

  kill -9 "$pid" 2>/dev/null || true
  wait "$pid" 2>/dev/null || true

  if [ ! -f "$generated" ]; then
    echo "Error: qlmanage failed to render $src at ${size}x${size}." >&2
    echo "       Try: killall -9 QuickLookUIService quicklookd" >&2
    exit 1
  fi

  mv "$generated" "$OUTPUT_DIR/$dest_name"
  printf '  %-32s %dx%d\n' "$dest_name" "$size" "$size"
}

echo "Generating app icons:"
echo "  light source: $LIGHT_SVG"
echo "  dark source:  $DARK_SVG"
echo "  output dir:   $OUTPUT_DIR"
echo

render "$LIGHT_SVG" 180 "apple-touch-icon.png"
render "$DARK_SVG"  180 "apple-touch-icon-dark.png"
render "$LIGHT_SVG" 192 "icon-192.png"
render "$LIGHT_SVG" 512 "icon-512.png"
render "$DARK_SVG"  192 "icon-192-dark.png"
render "$DARK_SVG"  512 "icon-512-dark.png"
render "$LIGHT_SVG"  32 "favicon-32.png"
render "$LIGHT_SVG"  16 "favicon-16.png"
render "$DARK_SVG"   32 "favicon-32-dark.png"
render "$DARK_SVG"   16 "favicon-16-dark.png"

if command -v python3 >/dev/null 2>&1; then
  APP_ICON_LIGHT_SVG="$LIGHT_SVG" \
  APP_ICON_DARK_SVG="$DARK_SVG" \
  APP_FAVICON_OUT="$OUTPUT_DIR/favicon.svg" \
    python3 "$SCRIPT_DIR/generate-favicon.py"
else
  echo "  warning: python3 not found; skipping favicon.svg"
fi

echo
echo "Done."
