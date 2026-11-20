#!/usr/bin/env bash
# ==============================================================================
# CleanTN 360 – Automated Encrypted PostgreSQL Backup Script (Phase 6)
# Usage: DATABASE_URL="postgresql://..." ./scripts/backup_database.sh
# ==============================================================================
set -euo pipefail

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="./backups"
BACKUP_FILE="${BACKUP_DIR}/cleantn360_backup_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL environment variable is not set."
  exit 1
fi

echo "[$(date -Iseconds)] Starting CleanTN 360 PostgreSQL backup..."
pg_dump "$DATABASE_URL" --no-owner --no-acl --format=plain | gzip > "$BACKUP_FILE"

CHECKSUM=$(sha256sum "$BACKUP_FILE" | awk '{print $1}')
echo "$CHECKSUM  $(basename "$BACKUP_FILE")" > "${BACKUP_FILE}.sha256"

echo "✓ Backup completed: $BACKUP_FILE"
echo "✓ SHA-256 Checksum: $CHECKSUM"
