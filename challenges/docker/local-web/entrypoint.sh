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

mkdir -p /srv/shop-site
cat > /srv/shop-site/index.html <<EOF
<!doctype html>
<html>
  <body>
    <h1>Магазин «Продукты и Баги»</h1>
    <p>Сайт скоро откроется. Следите за новостями!</p>
    <!-- служебная заметка для админа, удалить перед запуском: $FLAG_VALUE -->
  </body>
</html>
EOF

exec python3 /opt/serve.py
