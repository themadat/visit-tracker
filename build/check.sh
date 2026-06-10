#!/usr/bin/env bash
#
# check.sh — one-command parse check for Trail Log.
#
# Runs every assets/js companion through jsc (they execute as plain const
# definitions, no DOM), then extracts the main inline <script> from
# index.html and parses it wrapped in a function so DOM code never executes.
#
# Usage:  ./build/check.sh        (exit 0 = all parse clean)
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
JSC="/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc"

if [ ! -x "$JSC" ]; then
  echo "Error: jsc not found at $JSC (macOS JavaScriptCore required)." >&2
  exit 1
fi

fail=0

for f in "$REPO_ROOT"/assets/js/*.js; do
  if "$JSC" "$f" >/dev/null 2>&1; then
    printf 'PARSE OK   %s\n' "$(basename "$f")"
  else
    printf 'PARSE FAIL %s\n' "$(basename "$f")"
    "$JSC" "$f" 2>&1 | head -3
    fail=1
  fi
done

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

python3 - "$REPO_ROOT/index.html" "$TMP/main.js" <<'EOF'
import re, sys
html = open(sys.argv[1], encoding="utf-8").read()
blocks = re.findall(r"<script>\n([\s\S]*?)\n  </script>", html)
if not blocks:
    sys.exit("no inline <script> blocks found in index.html")
open(sys.argv[2], "w", encoding="utf-8").write(
    "function __syntaxCheckOnly__() {\n" + blocks[-1] + "\n}\n")
EOF

if "$JSC" "$TMP/main.js" >/dev/null 2>&1; then
  printf 'PARSE OK   index.html main <script>\n'
else
  printf 'PARSE FAIL index.html main <script>\n'
  "$JSC" "$TMP/main.js" 2>&1 | head -3
  fail=1
fi

exit "$fail"
