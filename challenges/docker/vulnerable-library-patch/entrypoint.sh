#!/bin/sh
set -e
FLAG_VALUE="${FLAG:-MISSING_FLAG}"

mkdir -p /app
cat > /app/package-manifest.json <<'JSON'
{
  "name": "warehouse-sync-service",
  "description": "Внутренний сервис синхронизации остатков склада",
  "dependencies": {
    "lodash": "4.17.15"
  }
}
JSON

cat > /app/SECURITY_ADVISORY.md <<'MD'
Сканер зависимостей нашёл в этом сервисе lodash 4.17.15.
Известная уязвимость: prototype pollution (исправлено в лодаше 4.17.21).
Обновите версию в /app/package-manifest.json.
MD

(
  while true; do
    sleep 2
    if grep -q '"lodash": *"4\.17\.21"' /app/package-manifest.json 2>/dev/null; then
      echo "$FLAG_VALUE" > /root/flag.txt
    fi
  done
) &

tail -f /dev/null
