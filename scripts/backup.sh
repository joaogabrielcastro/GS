#!/usr/bin/env bash
# Backup diário: PostgreSQL + pasta de uploads
# Uso: ./scripts/backup.sh
# Cron: 0 3 * * * /caminho/GS/scripts/backup.sh >> /var/log/gs-backup.log 2>&1

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/gs}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
UPLOAD_PATH="${UPLOAD_PATH:-/data/gs/uploads}"

mkdir -p "$BACKUP_DIR"

if [ -f "$ROOT/backend/.env" ]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/backend/.env"
  set +a
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "DATABASE_URL não definida. Exporte ou configure backend/.env"
  exit 1
fi

DUMP_FILE="$BACKUP_DIR/db_$TIMESTAMP.sql.gz"
pg_dump "$DATABASE_URL" | gzip > "$DUMP_FILE"
echo "Dump: $DUMP_FILE"

if [ -d "$UPLOAD_PATH" ]; then
  UPLOAD_ARCHIVE="$BACKUP_DIR/uploads_$TIMESTAMP.tar.gz"
  tar -czf "$UPLOAD_ARCHIVE" -C "$(dirname "$UPLOAD_PATH")" "$(basename "$UPLOAD_PATH")"
  echo "Uploads: $UPLOAD_ARCHIVE"
else
  echo "Aviso: UPLOAD_PATH não encontrado: $UPLOAD_PATH"
fi

# Manter últimos 14 dias
find "$BACKUP_DIR" -type f \( -name 'db_*.sql.gz' -o -name 'uploads_*.tar.gz' \) -mtime +14 -delete

echo "Backup concluído."
