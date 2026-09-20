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
LOGDIR=/var/log/app
mkdir -p "$LOGDIR"

yes "$(date -u +%FT%TZ) INFO request served ok" | head -c 20000000 > "$LOGDIR/access.log"

(
  set +e
  while true; do
    sleep 2
    if [ -f "$LOGDIR/access.log.1.gz" ]; then
      if [ -f "$LOGDIR/access.log" ]; then
        SIZE=$(wc -c < "$LOGDIR/access.log")
      else
        SIZE=0
      fi
      if [ "$SIZE" -lt 1000000 ]; then
        echo "$FLAG_VALUE" > /root/flag.txt
      fi
    fi
  done
) &

tail -f /dev/null
