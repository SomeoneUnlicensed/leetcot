#!/usr/bin/env bash
# Removes participant environment containers that no running TaskEnvironment row points to
# (e.g. the app crashed between `docker run` and the database write) once they are older than
# ORPHAN_MIN_AGE_SECONDS. The app's own reaper only knows about containers that have a row.
#
# Aborts without touching anything if the database cannot be queried, so an outage of the
# database can never turn every environment into an "orphan".
set -Eeuo pipefail

DB_CONTAINER="${DB_CONTAINER:-leetcot-db-1}"
ORPHAN_MIN_AGE_SECONDS="${ORPHAN_MIN_AGE_SECONDS:-900}"
LABEL="lentatech.app=debug-simulator"

referenced="$(docker exec "$DB_CONTAINER" psql -U postgres -d leetcot -At -c "SELECT \"containerName\" FROM \"TaskEnvironment\" WHERE status = 'RUNNING'")"

now="$(date +%s)"
while read -r name; do
  [ -n "$name" ] || continue
  if printf '%s\n' "$referenced" | grep -qxF "$name"; then continue; fi
  created="$(docker inspect -f '{{.Created}}' "$name" 2>/dev/null || true)"
  [ -n "$created" ] || continue
  age=$(( now - $(date -d "$created" +%s) ))
  if (( age >= ORPHAN_MIN_AGE_SECONDS )); then
    docker rm -f "$name" > /dev/null
    echo "$(date -u +%FT%TZ) removed orphan environment $name (age ${age}s)"
  fi
done < <(docker ps -a --filter "label=$LABEL" --format '{{.Names}}')
