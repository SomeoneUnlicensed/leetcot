#!/bin/sh
set -e
FLAG_VALUE="${FLAG:-MISSING_FLAG}"

redis-server --bind 0.0.0.0 --protected-mode no --save '' --appendonly no --daemonize no &
REDIS_PID=$!

for i in $(seq 1 20); do
  if redis-cli ping >/dev/null 2>&1; then break; fi
  sleep 0.5
done

redis-cli SET "internal:backup_notes" "$FLAG_VALUE" >/dev/null
redis-cli SET "internal:session_cache" "unused" >/dev/null

wait "$REDIS_PID"
