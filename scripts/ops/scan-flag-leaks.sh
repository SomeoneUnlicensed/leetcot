#!/usr/bin/env bash
# Checks, per task image, whether the per-instance flag can be read by a participant straight
# away instead of being earned: from the environment of their shell, or from the environment or
# command line of any running process. Also reports where the flag sits on disk right after
# boot (information for the task authors - a root shell can read those files without solving
# anything, so they are worth a look for tasks that are meant to be "fixed", not "found").
#
#   scripts/ops/scan-flag-leaks.sh                # all lentatech/* images
#   scripts/ops/scan-flag-leaks.sh network-scan   # a single task
#
# Containers are started like the app starts them (task-container.sh) and named leak-*; they are
# removed at the end. Exit status is non-zero when anything leaks through env/proc.
set -Eeuo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ops/task-container.sh
source "$HERE/task-container.sh"

FLAG_VALUE="LENTA{leak_scan_7f3a91c2}"
SETTLE_SECONDS="${SETTLE_SECONDS:-6}"

if [ "$#" -gt 0 ]; then
  slugs=("$@")
else
  mapfile -t slugs < <(all_task_slugs)
fi

# The participant's terminal is `docker exec -it [-u user] <container> sh -l` (apps/web/server.ts).
participant_sh() { docker exec "$1" sh -l -c "$2" 2> /dev/null || true; }

leaky=0
for slug in "${slugs[@]}"; do
  name="leak-$slug-$$"
  start_task_container "$name" "$slug" "$FLAG_VALUE"
  sleep "$SETTLE_SECONDS"

  channels=()
  [ -n "$(participant_sh "$name" 'echo "$FLAG"')" ] && channels+=('$FLAG in shell')
  participant_sh "$name" 'cat /proc/[0-9]*/environ 2>/dev/null | tr "\0" "\n"' | grep -qF "$FLAG_VALUE" && channels+=('/proc/*/environ')
  participant_sh "$name" 'cat /proc/[0-9]*/cmdline 2>/dev/null | tr "\0" "\n"' | grep -qF "$FLAG_VALUE" && channels+=('/proc/*/cmdline')

  # explicit directories only: a recursive grep from / would walk /proc and /sys
  on_disk="$(participant_sh "$name" "timeout 30 grep -rlF '$FLAG_VALUE' /etc /opt /root /home /srv /var /tmp /usr/local /run 2>/dev/null | sort -u | tr '\n' ' '")"
  docker rm -f "$name" > /dev/null 2>&1 || true

  if [ "${#channels[@]}" -eq 0 ]; then
    echo "clean  $slug   (flag on disk at boot: ${on_disk:-nowhere})"
  else
    echo "LEAK   $slug: ${channels[*]}"
    leaky=$((leaky + 1))
  fi
done

echo "--- $leaky of ${#slugs[@]} images leak the flag through env/proc ---"
[ "$leaky" -eq 0 ]
