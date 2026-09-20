#!/bin/sh
set -e
# The app hands the flag over as a one-shot file so it never sits in the container environment,
# where every participant shell would see it as $FLAG and in /proc/*/environ. $FLAG stays as a
# fallback for older callers.
if [ -r /.lenta-flag ]; then
  FLAG="$(cat /.lenta-flag)"
  rm -f /.lenta-flag
fi
FLAG_VALUE="${FLAG:-MISSING_FLAG}"
unset FLAG

redis-server --bind 0.0.0.0 --protected-mode no --save '' --appendonly no --daemonize no &
REDIS_PID=$!

for i in $(seq 1 20); do
  if redis-cli ping >/dev/null 2>&1; then break; fi
  sleep 0.5
done

redis-cli SET "internal:backup_notes" "$FLAG_VALUE" >/dev/null
redis-cli SET "internal:session_cache" "unused" >/dev/null

wait "$REDIS_PID"
