#!/usr/bin/env bash
set -euo pipefail

# Runs Gradle Versions Plugin to report dependency updates across all modules.
# Outputs reports under build/dependencyUpdates (plain, json, html).

GRADLEW="${GRADLEW:-./gradlew}"

exec "$GRADLEW" dependencyUpdates \
  -Drevision=release \
  -DoutputFormatter=json,plain,html \
  -DoutputDir=build/dependencyUpdates

