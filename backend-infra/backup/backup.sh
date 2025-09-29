#!/usr/bin/env bash
set -euo pipefail

# Load .env if present (from repo root)
ROOT_DIR="$(cd "$(dirname "$0")"/../.. && pwd)"
ENV_FILE="$ROOT_DIR/.env"
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck source=/dev/null
  set -o allexport
  source "$ENV_FILE"
  set +o allexport
fi

ARTIFACTS_DIR="$ROOT_DIR/backend-infra/backup/artifacts"
mkdir -p "$ARTIFACTS_DIR"

# Defaults
POSTGRES_DB=${POSTGRES_DB:-aquastream}
POSTGRES_USER=${POSTGRES_USER:-aquastream}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}

SCHEMAS=(user event crew payment notification media)

DATE=$(date +%Y%m%d)
WEEK=$(date +%G-%V) # ISO year-week
DAY_OF_WEEK=$(date +%u) # 1..7 (Mon..Sun)
DAY_OF_MONTH=$(date +%d)

echo "[backup] Starting per-schema backups to $ARTIFACTS_DIR"

for schema in "${SCHEMAS[@]}"; do
  OUT_FILE="$ARTIFACTS_DIR/${schema}_${DATE}.dump.gz"
  echo "[backup] Dumping schema '$schema' -> $(basename "$OUT_FILE")"
  docker run --rm \
    --network aquastream-net \
    -e PGPASSWORD="$POSTGRES_PASSWORD" \
    -v "$ARTIFACTS_DIR:/backup" \
    postgres:16-alpine \
    sh -lc "pg_dump -Fc -h postgres -U '$POSTGRES_USER' -d '$POSTGRES_DB' -n '$schema' -f /backup/${schema}_${DATE}.dump && gzip -f /backup/${schema}_${DATE}.dump"

  # Weekly copy (on Sunday)
  if [[ "$DAY_OF_WEEK" == "7" ]]; then
    cp -f "$OUT_FILE" "$ARTIFACTS_DIR/weekly_${schema}_${WEEK}.dump.gz"
  fi
  # Monthly copy (on the 1st)
  if [[ "$DAY_OF_MONTH" == "01" ]]; then
    MONTH_TAG=$(date +%Y-%m)
    cp -f "$OUT_FILE" "$ARTIFACTS_DIR/monthly_${schema}_${MONTH_TAG}.dump.gz"
  fi

  # Retention: keep 7 daily, 4 weekly, 3 monthly
  ls -1t "$ARTIFACTS_DIR"/${schema}_*.dump.gz 2>/dev/null | tail -n +8 | xargs -r rm -f || true
  ls -1t "$ARTIFACTS_DIR"/weekly_${schema}_*.dump.gz 2>/dev/null | tail -n +5 | xargs -r rm -f || true
  ls -1t "$ARTIFACTS_DIR"/monthly_${schema}_*.dump.gz 2>/dev/null | tail -n +4 | xargs -r rm -f || true
done

echo "[backup] Done. Files in $ARTIFACTS_DIR:"
ls -lh "$ARTIFACTS_DIR" | cat

