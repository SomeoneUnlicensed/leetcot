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

mkdir -p /var/log/shop
awk 'BEGIN { for (i = 1; i <= 3000; i++) printf "2026-03-04 10:%02d:%02d INFO request %d served ok\n", int(i / 60) % 60, i % 60, i }' > /var/log/shop/app.log
sed -i "1742i 2026-03-04 10:29:02 WARN payment-token=$FLAG_VALUE попал в лог по ошибке, удалить" /var/log/shop/app.log

exec tail -f /dev/null
