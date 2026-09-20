#!/usr/bin/env bash
# Restarts the active app container when it stops answering (a hung Node process is not
# something Docker's restart policy notices). Runs every minute from cron; each run probes
# up to three times, 15 s apart, and only restarts if every probe fails.
#
# Does nothing while a deploy is running (it holds the deploy lock), and probes the active
# instance directly rather than through nginx, so an nginx problem is never "fixed" by
# restarting the app.
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/home/ubuntu/leetcot}"
UPSTREAM_CONF="${UPSTREAM_CONF:-/etc/nginx/conf.d/leetcot-upstream.conf}"
LOCK_FILE="$APP_DIR/.deploy/lock"
PROBES=3
PROBE_GAP_SECONDS=15

exec 9> "$LOCK_FILE"
flock -n 9 || exit 0   # a deploy (or rollback) is in progress

port="$(sed -n 's/^[[:space:]]*server 127\.0\.0\.1:\([0-9]*\);.*/\1/p' "$UPSTREAM_CONF" | head -n1)"
case "$port" in
  3002) container=leetcot-app-blue ;;
  3012) container=leetcot-app-green ;;
  *) echo "$(date -u +%FT%TZ) watchdog: cannot determine the active instance" >&2; exit 1 ;;
esac

for attempt in $(seq 1 "$PROBES"); do
  if curl -fsS -o /dev/null --max-time 10 "http://127.0.0.1:$port/login"; then
    exit 0
  fi
  if (( attempt < PROBES )); then sleep "$PROBE_GAP_SECONDS"; fi
done

echo "$(date -u +%FT%TZ) watchdog: $container did not answer $PROBES probes in a row, restarting it"
docker restart -t 20 "$container" > /dev/null
