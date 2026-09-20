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

redis-server --bind 127.0.0.1 --protected-mode no --save '' --appendonly no &

for i in $(seq 1 30); do
  redis-cli ping >/dev/null 2>&1 && break
  sleep 0.3
done

redis-cli SET "user:1001" "ivanov" >/dev/null
redis-cli SET "user:1002" "petrova" >/dev/null
redis-cli SET "session:cache" "expired" >/dev/null
redis-cli SET "backup:note" "Резервная заметка админа. Код: $FLAG_VALUE" >/dev/null
redis-cli SET "cart:tmp" "3 items" >/dev/null

wait
