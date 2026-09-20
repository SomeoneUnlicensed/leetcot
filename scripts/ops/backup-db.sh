#!/usr/bin/env bash
# Logical backup of the Postgres database (pg_dump custom format, compressed).
# Keeps hourly dumps for 3 days and one dump per UTC day for 30 days.
#
#   backup-db.sh            # normally run from /etc/cron.d/leetcot-ops (hourly)
#   BACKUP_DIR=/x backup-db.sh
#
# Restore: scripts/ops/restore-db.sh <dump> [target-db]
set -Eeuo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/leetcot}"
DB_CONTAINER="${DB_CONTAINER:-leetcot-db-1}"
MIN_DUMP_BYTES=2048

umask 077
mkdir -p "$BACKUP_DIR/hourly" "$BACKUP_DIR/daily"

ts="$(date -u +%Y%m%dT%H%M%SZ)"
day="$(date -u +%Y%m%d)"
tmp="$BACKUP_DIR/.dump-$ts.tmp"
trap 'rm -f "$tmp"' EXIT

docker exec "$DB_CONTAINER" pg_dump -U postgres -d leetcot -Fc > "$tmp"

# a failed or empty dump must never replace good history
if [ "$(stat -c %s "$tmp")" -lt "$MIN_DUMP_BYTES" ]; then
  echo "$(date -u +%FT%TZ) backup FAILED: dump suspiciously small ($(stat -c %s "$tmp") bytes)" >&2
  exit 1
fi
# the dump must be readable back (catches truncated output)
docker exec -i "$DB_CONTAINER" pg_restore -l < "$tmp" > /dev/null

mv "$tmp" "$BACKUP_DIR/hourly/leetcot-$ts.dump"
if ! ls "$BACKUP_DIR"/daily/leetcot-"$day"T*.dump > /dev/null 2>&1; then
  cp "$BACKUP_DIR/hourly/leetcot-$ts.dump" "$BACKUP_DIR/daily/leetcot-$ts.dump"
fi

find "$BACKUP_DIR/hourly" -name '*.dump' -mmin +4320 -delete
find "$BACKUP_DIR/daily" -name '*.dump' -mtime +30 -delete
echo "$(date -u +%FT%TZ) backup ok: leetcot-$ts.dump ($(stat -c %s "$BACKUP_DIR/hourly/leetcot-$ts.dump") bytes)"
