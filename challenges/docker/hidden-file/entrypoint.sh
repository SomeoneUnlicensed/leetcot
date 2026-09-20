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

cat > /root/.private-note <<EOF
Личная заметка администратора (не для посторонних).
Резервный пропуск: $FLAG_VALUE
EOF
echo "Список дел на неделю: обновить прайс, проверить кассы, заказать бумагу." > /root/todo.txt

exec tail -f /dev/null
