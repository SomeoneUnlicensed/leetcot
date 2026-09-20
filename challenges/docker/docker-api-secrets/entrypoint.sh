#!/bin/sh
set -e
# The flag arrives as a one-shot file so it never sits in the container environment, where every
# participant shell would see it as $FLAG and in /proc/*/environ.
if [ -r /.lenta-flag ]; then
  FLAG="$(cat /.lenta-flag)"
  rm -f /.lenta-flag
fi
FLAG_VALUE="${FLAG:-MISSING_FLAG}"
unset FLAG

printf '%s' "$FLAG_VALUE" | python3 /opt/dockerapi.py &

exec tail -f /dev/null
