#!/bin/sh
set -e
FLAG_VALUE="${FLAG:-MISSING_FLAG}"
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
