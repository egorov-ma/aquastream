#!/usr/bin/env bash
set -euo pipefail

# Scan Gradle module files for hardcoded dependency versions
# Excludes: root build.gradle (version catalog), plugin version lines, and BOM imports

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Scanning for hardcoded dependency versions in module build.gradle files..." >&2

rg -n --no-heading \
  -g '!build.gradle' \
  -g '!*build.gradle.kts' \
  -g '!*gradle/**' \
  -g '!**/node_modules/**' \
  -e "^\s*(api|implementation|runtimeOnly|compileOnly|testImplementation)\s+['\"][^:'\"]+:[^:'\"]+:[0-9][0-9A-Za-z.+_-]*['\"]" \
  "$ROOT_DIR" || true

echo "\nTip: Prefer versions managed via BOM or root ext vars." >&2

