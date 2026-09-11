#!/bin/sh
set -e
FLAG_VALUE="${FLAG:-MISSING_FLAG}"

mkdir -p /var/log/app
python3 /srv/generate_log.py "$FLAG_VALUE" /var/log/app/access.log

tail -f /dev/null
