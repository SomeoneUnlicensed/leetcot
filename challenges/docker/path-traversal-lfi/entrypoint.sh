#!/bin/sh
set -e
FLAG_VALUE="${FLAG:-MISSING_FLAG}"

mkdir -p /srv/webroot
echo "Складской отчёт за квартал. Ничего интересного." > /srv/webroot/report.txt

mkdir -p /srv/config
cat > /srv/config/app.conf <<CONF
[database]
host=internal-db.local
user=svc_report
password_hint=see vault
debug_flag=${FLAG_VALUE}
CONF

exec python3 /srv/app.py
