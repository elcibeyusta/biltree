#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
cd "$PROJECT_ROOT"

if [ -f ".env" ]; then
  # shellcheck disable=SC1091
  set -a
  source ".env"
  set +a
fi

DB_NAME="${DB_NAME:-bilkent_secret_gifts}"
DB_USER="${DB_USER:-postgres}"
BACKUP_DIR="${1:-$PROJECT_ROOT/backups}"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP_DIR"
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql"

echo "[backup_db] Creating dump at $BACKUP_FILE"
docker compose exec -T db pg_dump -U "$DB_USER" "$DB_NAME" > "$BACKUP_FILE"
echo "[backup_db] Backup completed."

if [[ "$RETENTION_DAYS" =~ ^[0-9]+$ ]] && [ "$RETENTION_DAYS" -gt 0 ]; then
  PRUNE_AFTER=$((RETENTION_DAYS - 1))
  echo "[backup_db] Pruning backups older than $RETENTION_DAYS day(s)"
  find "$BACKUP_DIR" -name "${DB_NAME}_*.sql" -type f -mtime +"$PRUNE_AFTER" -print -delete
fi

