#!/usr/bin/env bash
set -euo pipefail

# List duplicated dependencies declared across modules (group:artifact only)

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

TMP_FILE="$(mktemp)"
trap 'rm -f "$TMP_FILE"' EXIT

rg -n --no-heading \
  -g '!build.gradle' \
  -e "^\s*(api|implementation|runtimeOnly|compileOnly|testImplementation)\s+['\"][^:'\"]+:[^:'\"]+(:[^'\"]+)?['\"]" \
  "$ROOT_DIR" \
| awk -F"[:'\"]" '{ for(i=1;i<=NF;i++) if($i ~ /^(api|implementation|runtimeOnly|compileOnly|testImplementation)$/) print $(i+1)":"$(i+2) }' \
| sort | uniq -c | sort -nr > "$TMP_FILE"

echo "Duplicated dependencies (group:artifact) across modules:" >&2
cat "$TMP_FILE" | awk '$1 > 1 { printf("%4s  %s\n", $1, $2) }'

echo "\nTip: Consider moving common deps to shared modules or relying on starters/BOMs." >&2

