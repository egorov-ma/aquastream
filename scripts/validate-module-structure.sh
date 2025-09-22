#!/usr/bin/env bash
set -euo pipefail

# Validate module structure against conventions:
# - Only *-api modules should apply Spring Boot plugin locally
# - Library modules should not define bootJar/jar overrides (configured in root)

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
STATUS=0

echo "Checking for Spring Boot plugin in non-API modules..." >&2
rg -n --no-heading \
  -g '!**/*-api/build.gradle' \
  -e "id 'org\.springframework\.boot'|apply plugin:\s*'org\.springframework\.boot'" \
  "$ROOT_DIR" && { echo "Found Boot plugin in non-API modules." >&2; STATUS=1; } || true

echo "\nChecking for local jar/bootJar blocks (should be centralized)..." >&2
rg -n --no-heading \
  -e "^\s*(jar|bootJar)\s*\{" \
  -g '!build.gradle' \
  "$ROOT_DIR" && { echo "Found local jar/bootJar blocks in modules." >&2; STATUS=1; } || true

exit $STATUS

