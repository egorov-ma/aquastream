#!/usr/bin/env sh
set -eu

# This script bootstraps MinIO: configures alias and ensures buckets exist.
# It is intended to run inside minio/mc container.

MINIO_HOST="${MINIO_HOST:-http://minio:9000}"
MINIO_USER="${MINIO_ROOT_USER:?MINIO_ROOT_USER is required}"
MINIO_PASS="${MINIO_ROOT_PASSWORD:?MINIO_ROOT_PASSWORD is required}"

# Comma/space separated list of buckets to create (idempotent)
MINIO_BOOTSTRAP_BUCKETS="${MINIO_BOOTSTRAP_BUCKETS:-aquastream-media}"
# If true, allow anonymous download for buckets (dev convenience)
MINIO_BUCKET_PUBLIC="${MINIO_BUCKET_PUBLIC:-false}"

echo "[minio-bootstrap] Waiting for MinIO at ${MINIO_HOST} (mc ls)..."
until (mc alias set minio "${MINIO_HOST}" "${MINIO_USER}" "${MINIO_PASS}" >/dev/null 2>&1 \
       && mc ls minio >/dev/null 2>&1); do
  sleep 2
  printf '.'
done
echo " ready"

echo "[minio-bootstrap] Configure mc alias (confirmed)"
mc alias set minio "${MINIO_HOST}" "${MINIO_USER}" "${MINIO_PASS}" >/dev/null 2>&1 || true

to_space() {
  # turn comma or semicolon separated list into space-separated
  echo "$1" | tr ',;' '  '
}

for bucket in $(to_space "${MINIO_BOOTSTRAP_BUCKETS}"); do
  [ -z "${bucket}" ] && continue
  echo "[minio-bootstrap] Ensure bucket: ${bucket}"
  mc mb -p "minio/${bucket}" >/dev/null 2>&1 || true
  if [ "${MINIO_BUCKET_PUBLIC}" = "true" ]; then
    echo "[minio-bootstrap] Set anonymous download for ${bucket}"
    mc anonymous set download "minio/${bucket}" >/dev/null 2>&1 || true
  fi
done

echo "[minio-bootstrap] Done"
