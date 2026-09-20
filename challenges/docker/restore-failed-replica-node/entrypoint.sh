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

redis-server --port 6379 --bind 0.0.0.0 --protected-mode no --save '' --appendonly no &
redis-server --port 6380 --bind 0.0.0.0 --protected-mode no --save '' --appendonly no --replicaof 127.0.0.1 9999 &

for i in $(seq 1 20); do
  redis-cli -p 6379 ping >/dev/null 2>&1 && redis-cli -p 6380 ping >/dev/null 2>&1 && break
  sleep 0.5
done

redis-cli -p 6379 SET "warehouse:stock:total" "18420" >/dev/null
redis-cli -p 6379 SET "warehouse:last_sync" "2026-03-04T09:00:00Z" >/dev/null

(
  set +e
  while true; do
    sleep 2
    if redis-cli -p 6380 INFO replication 2>/dev/null | grep -q 'master_link_status:up'; then
      STOCK=$(redis-cli -p 6380 GET "warehouse:stock:total" 2>/dev/null)
      if [ "$STOCK" = "18420" ]; then
        echo "$FLAG_VALUE" > /root/flag.txt
      fi
    fi
  done
) &

tail -f /dev/null
