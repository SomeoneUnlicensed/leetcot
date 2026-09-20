#!/usr/bin/env bash
# Restore a backup made by backup-db.sh.
#
#   restore-db.sh <dump-file>                 # into a scratch database "leetcot_restore_test" (safe check)
#   restore-db.sh <dump-file> <target-db>     # into another database
#   restore-db.sh <dump-file> leetcot --overwrite-production
#
# Restoring over the live database needs the explicit flag AND the app stopped first:
#   docker stop leetcot-app-blue leetcot-app-green
set -Eeuo pipefail

DB_CONTAINER="${DB_CONTAINER:-leetcot-db-1}"
dump="${1:-}"
target="${2:-leetcot_restore_test}"
flag="${3:-}"

[ -n "$dump" ] && [ -f "$dump" ] || { echo "usage: $0 <dump-file> [target-db] [--overwrite-production]" >&2; exit 1; }
psql_() { docker exec -i "$DB_CONTAINER" psql -U postgres -v ON_ERROR_STOP=1 "$@"; }

if [ "$target" = leetcot ]; then
  [ "$flag" = "--overwrite-production" ] || { echo "refusing to touch the live database without --overwrite-production" >&2; exit 1; }
  docker exec -i "$DB_CONTAINER" pg_restore -U postgres -d leetcot --clean --if-exists --no-owner < "$dump"
  echo "live database restored from $dump"
  exit 0
fi

psql_ -d postgres -c "DROP DATABASE IF EXISTS \"$target\"" > /dev/null
psql_ -d postgres -c "CREATE DATABASE \"$target\"" > /dev/null
docker exec -i "$DB_CONTAINER" pg_restore -U postgres -d "$target" --no-owner < "$dump"
echo "restored into database \"$target\":"
psql_ -d "$target" -At -c "SELECT 'users=' || (SELECT count(*) FROM \"User\") || ' participants=' || (SELECT count(*) FROM \"ChampionshipParticipant\") || ' tasks=' || (SELECT count(*) FROM \"DebugTask\") || ' submissions=' || (SELECT count(*) FROM \"DebugSubmission\")"
if [ "$target" = leetcot_restore_test ]; then
  psql_ -d postgres -c "DROP DATABASE \"$target\"" > /dev/null
  echo "scratch database dropped - the dump is restorable"
fi
