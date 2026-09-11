#!/bin/sh
set -e
FLAG_VALUE="${FLAG:-MISSING_FLAG}"

mkdir -p /srv/samba/backups /var/lib/samba/private /run/samba

cat > /srv/samba/backups/warehouse_shift_report_2024-11.csv <<'CSV'
date,terminal,operator_id,items_scanned,discrepancies
2024-11-01,POS-03,OP-1042,884,0
2024-11-01,POS-07,OP-1108,1290,2
2024-11-02,POS-03,OP-1042,910,1
CSV

cat > /srv/samba/backups/terminal_sync_notes.txt <<'NOTES'
Старая шара для синка кассовых терминалов склада.
Не трогать, используется ночным job'ом ресинка остатков.
Учётку не заводили - шара была временная "на пару дней" ещё в 2021.
NOTES

mkdir -p /srv/samba/backups/internal
cat > /srv/samba/backups/internal/ops_backup_notes.txt <<EOF
Служебные заметки ночного бэкапа склада.
token: ${FLAG_VALUE}
EOF

chown -R nobody:nogroup /srv/samba/backups
find /srv/samba/backups -type d -exec chmod 755 {} \;
find /srv/samba/backups -type f -exec chmod 644 {} \;

exec smbd --foreground --no-process-group -s /etc/samba/smb.conf
