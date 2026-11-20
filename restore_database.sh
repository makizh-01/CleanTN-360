#!/usr/bin/env bash
# ==============================================================================
# CleanTN 360 – Disaster Recovery & Database Restore Script (Phase 6)
# Usage: DATABASE_URL="postgresql://..." ./scripts/restore_database.sh <file.sql.gz>
# ==============================================================================
set -euo pipefail

BACKUP_FILE="${1:-}"

if [ -z "$BACKUP_FILE" ] || [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Provide a valid .sql.gz backup file path."
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set."
  exit 1
fi

if [ -f "${BACKUP_FILE}.sha256" ]; then
  echo "Verifying SHA-256 backup integrity checksum..."
  (cd "$(dirname "$BACKUP_FILE")" && sha256sum -c "$(basename "${BACKUP_FILE}.sha256")")
fi

echo "Restoring CleanTN 360 database from $BACKUP_FILE..."
gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL"
echo "✓ Database restore completed cleanly."
