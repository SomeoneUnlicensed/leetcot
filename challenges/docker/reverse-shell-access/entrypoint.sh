#!/bin/sh
set -e
FLAG_VALUE="${FLAG:-MISSING_FLAG}"

(
  while true; do
    sleep 1
    if [ -f /tmp/proof/reverse-shell-confirmed ]; then
      mkdir -p /root
      cp /tmp/proof/reverse-shell-confirmed /root/flag.txt
    fi
  done
) &

exec python3 /srv/app.py
