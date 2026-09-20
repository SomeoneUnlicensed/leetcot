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
