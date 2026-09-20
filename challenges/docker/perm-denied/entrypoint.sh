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

mkdir -p /opt/tools
cat > /opt/tools/report.sh <<'SH'
#!/bin/sh
echo "Формирую отчёт по кассам..."
touch /run/report.done
echo "Готово. Код подтверждения записан в /root/flag.txt"
SH
chmod 644 /opt/tools/report.sh

# The flag is handed out only once the script has really run.
(
  set +e
  while true; do
    sleep 1
    if [ -e /run/report.done ]; then
      echo "$FLAG_VALUE" > /root/flag.txt
    fi
  done
) &

exec tail -f /dev/null
