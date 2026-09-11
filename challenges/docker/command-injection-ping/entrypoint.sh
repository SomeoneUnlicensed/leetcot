#!/bin/sh
set -e
FLAG_VALUE="${FLAG:-MISSING_FLAG}"

mkdir -p /srv/secret
echo "$FLAG_VALUE" > /srv/secret/flag.txt
chmod 644 /srv/secret/flag.txt

exec python3 /srv/app.py
