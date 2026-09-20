#!/usr/bin/env bash
# Runs the per-task end-to-end suite (scripts/ops/e2e-tasks.ts) inside the ACTIVE app container:
# every task's environment is started by the real app code, solved like a participant would,
# and the resulting flag is checked against the hash the submit route expects.
#
#   scripts/ops/run-e2e-tasks.sh                      # all 20 tasks (a few minutes)
#   scripts/ops/run-e2e-tasks.sh network-scan stolen-ssh-key
#
# Creates and removes TaskEnvironment rows for the first ADMIN user; safe to run on the live
# stack, but not while that admin is working through a task in the browser.
set -Eeuo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UPSTREAM_CONF="${UPSTREAM_CONF:-/etc/nginx/conf.d/leetcot-upstream.conf}"

port="$(sed -n 's/^[[:space:]]*server 127\.0\.0\.1:\([0-9]*\);.*/\1/p' "$UPSTREAM_CONF" | head -n1)"
case "$port" in
  3002) container=leetcot-app-blue ;;
  3012) container=leetcot-app-green ;;
  *) echo "cannot determine the active app container from $UPSTREAM_CONF" >&2; exit 1 ;;
esac

docker cp "$HERE/e2e-tasks.ts" "$container:/app/apps/web/e2e-tasks.ts"
trap 'docker exec "$container" rm -f /app/apps/web/e2e-tasks.ts' EXIT

set +e
docker exec -w /app/apps/web "$container" npx tsx e2e-tasks.ts "$@" 2>&1 | grep -v '^prisma:'
status="${PIPESTATUS[0]}"
set -e
exit "$status"
