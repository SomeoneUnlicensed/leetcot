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

cat > /root/welcome.txt <<EOF
Добро пожаловать в команду «Продуктов и Багов»!

Это ваш рабочий сервер. Загляните в эту записку, когда будете готовы:
всё, что нужно для первого дня, уже настроено.

Ваш пропуск на площадку: $FLAG_VALUE

Удачи!
EOF

exec tail -f /dev/null
