# shellcheck shell=bash
# Sourced by smoke-task-images.sh and scan-flag-leaks.sh.
# Starts a task container exactly the way the app does - keep in sync with runContainer in
# apps/web/src/server/environments.ts: created without the flag, the flag is handed over as a
# one-shot file that the image's entrypoint reads and deletes, then the container is started.

declare -A EXTRA_CAPS=(
  [firewall-block-malicious-ip]="NET_ADMIN NET_RAW"
  [traffic-sniffing]="NET_RAW NET_ADMIN"
)
FLAG_HANDOFF_PATH="/.lenta-flag"

# start_task_container <container-name> <task-slug> <flag>
start_task_container() {
  local name="$1" slug="$2" flag="$3" cap tmp
  local caps=()
  for cap in ${EXTRA_CAPS[$slug]:-}; do caps+=(--cap-add "$cap"); done

  docker create --name "$name" --init --network none --memory 256m --memory-swap 256m --cpus 0.5 \
    --pids-limit 128 --security-opt no-new-privileges:true "${caps[@]}" "lentatech/$slug:latest" > /dev/null
  tmp="$(mktemp)"
  printf '%s' "$flag" > "$tmp"
  docker cp "$tmp" "$name:$FLAG_HANDOFF_PATH"
  rm -f "$tmp"
  docker start "$name" > /dev/null
}

# all_task_slugs: every task image present locally
all_task_slugs() {
  docker images --format '{{.Repository}}' 'lentatech/*' | sed 's#^lentatech/##' | sort -u
}
