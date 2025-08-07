#!/bin/bash
set -euo pipefail

# Simple infrastructure validation script for AquaStream
# Usage: validate-infrastructure.sh [--quick]

QUICK=false
for arg in "$@"; do
    if [[ "$arg" == "--quick" ]]; then
        QUICK=true
    fi
done

PROJECT_ROOT="$(git rev-parse --show-toplevel)"
COMPOSE_DIR="$PROJECT_ROOT/infra/docker/compose"

run_compose_check() {
    local file="$1"
    local path="$COMPOSE_DIR/$file"

    if [[ ! -f "$path" ]]; then
        return 0
    fi

    if command -v docker >/dev/null 2>&1; then
        docker compose -f "$path" config >/dev/null 2>&1
    else
        echo "docker not found, skipping validation for $file"
    fi
}

for compose in docker-compose.dev.yml docker-compose.full.yml; do
    run_compose_check "$compose"
done

if $QUICK; then
    echo "Quick infrastructure validation completed"
else
    echo "Full infrastructure validation completed"
fi

exit 0

