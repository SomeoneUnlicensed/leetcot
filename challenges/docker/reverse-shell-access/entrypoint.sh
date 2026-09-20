#!/bin/sh
set -e
# app.py takes the flag from the one-shot hand-off file (/.lenta-flag) itself.

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
