#!/usr/bin/env bash
set -euo pipefail

# Detect unused version properties declared in root build.gradle ext {}
# Heuristic: picks keys from lines like: set('key', 'value') and checks usage as ${key}

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_FILE="$ROOT_DIR/build.gradle"

if [[ ! -f "$BUILD_FILE" ]]; then
  echo "build.gradle not found at $BUILD_FILE" >&2
  exit 1
fi

mapfile -t KEYS < <(awk \
  '/^\s*set\(\x27[^\x27]+\x27\s*,/{
     match($0, /set\(\x27([^\x27]+)\x27\s*,/, m);
     if (m[1] != "") print m[1];
   }' "$BUILD_FILE" | sort -u)

if [[ ${#KEYS[@]} -eq 0 ]]; then
  echo "No ext set('key', ...) entries found." >&2
  exit 0
fi

UNUSED=()
for key in "${KEYS[@]}"; do
  # Search project-wide for usage like ${key}, excluding the ext declaration lines themselves
  if ! rg -n --no-heading "\\$\\{${key}\\}" "$ROOT_DIR" \
      -g '!**/build/**' \
      -g '!**/.gradle/**' \
      -g '!**/.git/**' \
      -g '!scripts/**' \
      -S >/dev/null; then
    UNUSED+=("$key")
  fi
done

if [[ ${#UNUSED[@]} -eq 0 ]]; then
  echo "All ext version keys appear to be used." >&2
else
  echo "Unused ext version keys (no \${key} references found):" >&2
  for k in "${UNUSED[@]}"; do
    echo " - $k"
  done
fi

echo "\nTip: Remove stale ext versions or replace hardcoded occurrences with \${key}." >&2

