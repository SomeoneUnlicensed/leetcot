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

mkdir -p /var/www
cat > /var/www/index.html <<HTML
<!doctype html>
<html><body><h1>Портал складского учёта</h1><p>В разработке.</p></body></html>
HTML

echo "$FLAG_VALUE" > /opt/service-banner.txt

# Decoy public-looking service.
(cd /var/www && python3 -m http.server 8080 >/dev/null 2>&1) &

# Hidden internal service on a non-standard port: connecting to it dumps its
# banner, which carries the flag.
socat TCP-LISTEN:31337,fork,reuseaddr SYSTEM:'cat /opt/service-banner.txt' &

wait
