#!/bin/sh
set -e
FLAG_VALUE="${FLAG:-MISSING_FLAG}"

mkdir -p /srv/legacy-panel
cat > /srv/legacy-panel/index.html <<HTML
<!doctype html>
<html>
<head><title>Складская админ-панель (legacy)</title></head>
<body>
<h1>Складская админ-панель v0.3</h1>
<p>Сервис устарел, оставлен для миграции старых отчётов. Будет выведен из эксплуатации.</p>
<!-- TODO: убрать debug-вывод перед окончательным отключением -->
<p style="color:#ccc;font-size:11px">debug: ${FLAG_VALUE}</p>
</body>
</html>
HTML

mkdir -p /var/www
cat > /var/www/index.html <<HTML
<!doctype html>
<html><body><h1>Портал склада</h1><p>Актуальная версия — см. основной портал.</p></body></html>
HTML

(cd /var/www && python3 -m http.server 8080 >/dev/null 2>&1) &
(cd /srv/legacy-panel && python3 -m http.server 47821 >/dev/null 2>&1) &

wait
