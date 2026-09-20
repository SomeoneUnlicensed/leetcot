#!/usr/bin/env bash
# One-time (idempotent) install of the host-side operations jobs:
#   - hourly database backup           (leetcot-backup-db)
#   - orphaned environment cleanup     (leetcot-reap-orphans, every 10 minutes)
#   - app watchdog                     (leetcot-watchdog, every minute)
# The scripts are copied to /usr/local/sbin so cron (root) never executes files that a
# non-root user can rewrite; re-run this after changing them.
set -Eeuo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$HERE/../.." && pwd)"
SUDO=""
[ "$(id -u)" -eq 0 ] || SUDO="sudo"

$SUDO install -m 0755 "$HERE/backup-db.sh" /usr/local/sbin/leetcot-backup-db
$SUDO install -m 0755 "$HERE/reap-orphans.sh" /usr/local/sbin/leetcot-reap-orphans
$SUDO install -m 0755 "$HERE/watchdog.sh" /usr/local/sbin/leetcot-watchdog
$SUDO install -d -m 0700 /var/backups/leetcot

$SUDO tee /etc/cron.d/leetcot-ops > /dev/null <<EOF
# Managed by scripts/ops/install-ops.sh - do not edit by hand.
SHELL=/bin/bash
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
7 * * * * root /usr/local/sbin/leetcot-backup-db >> /var/log/leetcot-ops.log 2>&1
*/10 * * * * root /usr/local/sbin/leetcot-reap-orphans >> /var/log/leetcot-ops.log 2>&1
* * * * * root APP_DIR=$APP_DIR /usr/local/sbin/leetcot-watchdog >> /var/log/leetcot-ops.log 2>&1
EOF
$SUDO chmod 0644 /etc/cron.d/leetcot-ops

$SUDO tee /etc/logrotate.d/leetcot-ops > /dev/null <<'EOF'
/var/log/leetcot-ops.log {
    weekly
    rotate 8
    compress
    missingok
    notifempty
}
EOF

echo "installed. Backups: /var/backups/leetcot (hourly, 3 days) + daily (30 days). Log: /var/log/leetcot-ops.log"
