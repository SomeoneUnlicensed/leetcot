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

(
  set +e
  while true; do
    sleep 1
    if [ -f /tmp/proof/reverse-shell-confirmed ]; then
      mkdir -p /root
      cp /tmp/proof/reverse-shell-confirmed /root/flag.txt
    fi
  done
) &

exec python3 /srv/app.py
