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

mkdir -p /var/log/inventory /etc/inventory /opt/inventory
cat > /opt/inventory/config.ini.example <<'INI'
[inventory]
warehouse = main
listen_port = 9000
INI
cat > /opt/inventory/start.sh <<'SH'
#!/bin/sh
python3 /opt/inventory/app.py >> /var/log/inventory/error.log 2>&1 &
sleep 1
echo "Сервис запущен (если он не упал сразу — смотрите /var/log/inventory/error.log)"
SH
chmod +x /opt/inventory/start.sh
cat > /var/log/inventory/error.log <<'LOG'
2026-03-04 09:12:44 ERROR inventory: не найден файл настроек /etc/inventory/config.ini
2026-03-04 09:12:44 ERROR inventory: сервис остановлен
LOG

# The flag is handed out only once the service really answers.
(
  set +e
  while true; do
    sleep 2
    if curl -sf http://127.0.0.1:9000/status >/dev/null 2>&1; then
      echo "$FLAG_VALUE" > /root/flag.txt
    fi
  done
) &

exec tail -f /dev/null
