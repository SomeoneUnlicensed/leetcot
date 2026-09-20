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

mkdir -p /srv/secret
echo "$FLAG_VALUE" > /srv/secret/flag.txt
chmod 644 /srv/secret/flag.txt

exec python3 /srv/app.py
