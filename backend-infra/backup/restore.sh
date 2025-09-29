#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 <schema|all> <path-to-dump.dump[.gz]>" >&2
  echo "  schema: one of [user|event|crew|payment|notification|media] or 'all'" >&2
}

if [[ $# -ne 2 ]]; then
  usage; exit 1
fi

SCHEMA="$1"
DUMP_PATH="$2"

if [[ ! -f "$DUMP_PATH" ]]; then
  echo "Dump file not found: $DUMP_PATH" >&2
  exit 1
fi

# Load .env if present
ROOT_DIR="$(cd "$(dirname "$0")"/../.. && pwd)"
ENV_FILE="$ROOT_DIR/.env"
if [[ -f "$ENV_FILE" ]]; then
  # shellcheck source=/dev/null
  set -o allexport
  source "$ENV_FILE"
  set +o allexport
fi

POSTGRES_DB=${POSTGRES_DB:-aquastream}
POSTGRES_USER=${POSTGRES_USER:-aquastream}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-postgres}

ABS_DUMP="$(cd "$(dirname "$DUMP_PATH")" && pwd)/$(basename "$DUMP_PATH")"

TEMP_DUMP=""
cleanup() {
  if [[ -n "$TEMP_DUMP" && -f "$TEMP_DUMP" ]]; then
    rm -f "$TEMP_DUMP"
  fi
}
trap cleanup EXIT

INPUT_PATH="$ABS_DUMP"
if [[ "$ABS_DUMP" == *.gz ]]; then
  echo "[restore] Decompressing archive..."
  TEMP_DUMP="$(mktemp)"
  gunzip -c "$ABS_DUMP" > "$TEMP_DUMP"
  INPUT_PATH="$TEMP_DUMP"
fi

echo "[restore] Restoring from $(basename "$ABS_DUMP") into DB '$POSTGRES_DB'"

if [[ "$SCHEMA" == "all" ]]; then
  docker run --rm \
    --network aquastream-net \
    -e PGPASSWORD="$POSTGRES_PASSWORD" \
    -v "$INPUT_PATH:/backup/dump.dump:ro" \
    postgres:16-alpine \
    pg_restore -c -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" /backup/dump.dump
else
  case "$SCHEMA" in
    user|event|crew|payment|notification|media) ;;
    *) echo "Unknown schema: $SCHEMA" >&2; exit 1 ;;
  esac

  docker run --rm \
    --network aquastream-net \
    -e PGPASSWORD="$POSTGRES_PASSWORD" \
    -v "$INPUT_PATH:/backup/dump.dump:ro" \
    postgres:16-alpine \
    sh -lc "psql -h postgres -U '$POSTGRES_USER' -d '$POSTGRES_DB' -v ON_ERROR_STOP=1 -c 'CREATE SCHEMA IF NOT EXISTS \"$SCHEMA\";'; \
            pg_restore -c -n '$SCHEMA' -h postgres -U '$POSTGRES_USER' -d '$POSTGRES_DB' /backup/dump.dump"
fi

echo "[restore] Done."

