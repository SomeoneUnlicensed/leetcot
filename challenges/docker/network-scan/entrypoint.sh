#!/bin/sh
set -e
FLAG_VALUE="${FLAG:-MISSING_FLAG}"

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
