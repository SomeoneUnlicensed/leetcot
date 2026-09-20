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

for year in 2023 2024 2025; do
  for quarter in q1 q2 q3 q4; do
    mkdir -p "/srv/reports/$year/$quarter"
    echo "Заметки за $quarter $year: ничего срочного." > "/srv/reports/$year/$quarter/notes.txt"
    echo "Сводка за $quarter $year: продажи в норме." > "/srv/reports/$year/$quarter/summary.txt"
  done
done
cat > /srv/reports/2025/q3/incident-report.txt <<EOF
ОТЧЁТ ОБ ИНЦИДЕНТЕ
Касса №3 в магазине на Лесной не пробивала чеки 40 минут.
Причина найдена и устранена. Код закрытия инцидента: $FLAG_VALUE
EOF

exec tail -f /dev/null
