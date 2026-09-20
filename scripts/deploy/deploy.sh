#!/usr/bin/env bash
# Zero-downtime blue/green deploy for the Lenta debug-simulator stack.
#
#   scripts/deploy/deploy.sh [deploy] [--pull] [--allow-dirty] [--runner]
#   scripts/deploy/deploy.sh rollback
#   scripts/deploy/deploy.sh status
#
# Two identical app containers (blue :3002, green :3012) sit behind nginx (upstream
# "leetcot_app"). A deploy builds the image for the checked-out commit, starts the idle
# colour, waits until it answers, switches nginx to it with a graceful reload (in-flight
# requests and open terminal websockets finish on the old instance) and retires the old
# colour once its connections have drained. If anything fails before the switch, the old
# version keeps serving untouched.
#
# Why this does not log anyone out or break running tasks:
#   * sessions are stateless JWT cookies signed with NEXTAUTH_SECRET (same on both colours);
#   * participants' challenge containers are started through docker.sock and are independent
#     of the app containers;
#   * CTF flags live in the persistent "leetcot_flags" volume shared by both colours.
#
# Migrations run on the new instance while the old one still serves traffic, so keep them
# backwards compatible (add first, remove in a later deploy).
set -Eeuo pipefail

SELF="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/$(basename "${BASH_SOURCE[0]}")"
ROOT="$(cd "$(dirname "$SELF")/../.." && pwd)"
cd "$ROOT"

STATE_DIR="$ROOT/.deploy"
IMAGES_ENV="$STATE_DIR/images.env"
UPSTREAM_CONF="${UPSTREAM_CONF:-/etc/nginx/conf.d/leetcot-upstream.conf}"
SITE_HOST="${SITE_HOST:-lenta.leetcot.ru}"
IMAGE_REPO="${IMAGE_REPO:-leetcot-app}"
COMPAT_TAG="${COMPAT_TAG:-ghcr.io/someoneunlicensed/leetcot:debug-simulator}"
FLAGS_VOLUME="${FLAGS_VOLUME:-leetcot_flags}"
LEGACY_CONTAINER="leetcot-app-1"
HEALTH_TIMEOUT="${HEALTH_TIMEOUT:-600}"
DRAIN_MAX_SECONDS="${DRAIN_MAX_SECONDS:-1800}"
BLUE_PORT=3002
GREEN_PORT=3012

SUDO=""
[ "$(id -u)" -eq 0 ] || SUDO="sudo"

log() { printf '%s [deploy] %s\n' "$(date '+%F %T')" "$*" >&2; }
die() { log "ERROR: $*"; exit 1; }

mkdir -p "$STATE_DIR"
touch "$IMAGES_ENV"

dk() { $SUDO docker "$@"; }
dc() { $SUDO docker compose --env-file "$ROOT/.env" --env-file "$IMAGES_ENV" "$@"; }

port_of() {
  case "$1" in
    blue) echo "$BLUE_PORT" ;;
    green) echo "$GREEN_PORT" ;;
    *) return 1 ;;
  esac
}
color_of_port() {
  case "$1" in
    "$BLUE_PORT") echo blue ;;
    "$GREEN_PORT") echo green ;;
    *) die "unexpected upstream port '$1' in $UPSTREAM_CONF" ;;
  esac
}
other_color() { if [ "$1" = blue ]; then echo green; else echo blue; fi; }

active_port() {
  local p
  p="$(sed -n 's/^[[:space:]]*server 127\.0\.0\.1:\([0-9]*\);.*/\1/p' "$UPSTREAM_CONF" 2>/dev/null | head -n1)"
  [ -n "$p" ] || die "cannot read the active upstream from $UPSTREAM_CONF (run infra/nginx/install.sh first)"
  echo "$p"
}

get_image() { grep "^APP_${1^^}_IMAGE=" "$IMAGES_ENV" 2>/dev/null | head -n1 | cut -d= -f2- || true; }
set_image() {
  local key="APP_${1^^}_IMAGE" tmp
  tmp="$(mktemp)"
  grep -v "^${key}=" "$IMAGES_ENV" > "$tmp" || true
  if [ -n "${2:-}" ]; then echo "${key}=$2" >> "$tmp"; fi
  cat "$tmp" > "$IMAGES_ENV"
  rm -f "$tmp"
}

container_state() { dk inspect -f '{{.State.Status}}' "$1" 2>/dev/null || echo missing; }
active_conns() { { $SUDO ss -Htn state established "( sport = :$1 )" 2>/dev/null || true; } | wc -l; }

wait_healthy() {
  local color="$1" port container deadline state body
  port="$(port_of "$color")"
  container="leetcot-app-$color"
  deadline=$((SECONDS + HEALTH_TIMEOUT))
  while (( SECONDS < deadline )); do
    state="$(container_state "$container")"
    if [ "$state" != running ]; then
      log "$container is '$state'"
      return 1
    fi
    if curl -fsS -o /dev/null --max-time 5 "http://127.0.0.1:$port/login" 2>/dev/null; then
      body="$(curl -fsS --max-time 5 "http://127.0.0.1:$port/api/auth/providers" 2>/dev/null || true)"
      if [[ "$body" == *participant-login* ]]; then
        return 0
      fi
    fi
    sleep 3
  done
  log "$container did not become healthy within ${HEALTH_TIMEOUT}s"
  return 1
}

write_upstream() {
  local tmp
  tmp="$(mktemp)"
  cat > "$tmp" <<EOF
# Managed by scripts/deploy/deploy.sh - do not edit by hand.
upstream leetcot_app {
    server 127.0.0.1:${1};
}
EOF
  $SUDO install -m 0644 "$tmp" "$UPSTREAM_CONF"
  rm -f "$tmp"
}

# Point nginx at $1 (port). Reverts and returns non-zero if nginx or the front door disagrees.
switch_upstream() {
  local port="$1" prev
  prev="$(active_port)"
  write_upstream "$port"
  if ! $SUDO nginx -t >/dev/null 2>&1; then
    write_upstream "$prev"
    log "nginx config test failed, upstream stays on :$prev"
    return 1
  fi
  $SUDO systemctl reload nginx
  sleep 2
  if ! curl -fsS -o /dev/null --max-time 10 --resolve "$SITE_HOST:443:127.0.0.1" "https://$SITE_HOST/login"; then
    log "front-door check failed after the switch, reverting to :$prev"
    write_upstream "$prev"
    $SUDO nginx -t >/dev/null 2>&1 && $SUDO systemctl reload nginx
    return 1
  fi
}

# Runs detached after a switch: wait until the old instance has no open connections
# (or DRAIN_MAX_SECONDS passed), then stop it. Skips the stop if it became active again.
drain_and_stop() {
  local name="$1" port="$2" end n=0 quiet=0
  end=$((SECONDS + DRAIN_MAX_SECONDS))
  log "draining $name (port $port), waiting up to ${DRAIN_MAX_SECONDS}s for connections to close"
  while (( SECONDS < end )); do
    n="$(active_conns "$port")"
    if [ "$n" -eq 0 ]; then quiet=$((quiet + 1)); else quiet=0; fi
    if (( quiet >= 3 )); then break; fi
    sleep 10
  done
  if [ "$(active_port)" = "$port" ]; then
    log "$name is the active instance again, not stopping it"
    return 0
  fi
  log "stopping $name (open connections: $n)"
  if [ "$name" = "$LEGACY_CONTAINER" ]; then
    dk rm -f "$name" >/dev/null
  else
    dk stop -t 30 "$name" >/dev/null
  fi
  log "$name stopped"
}

start_drain() {
  setsid nohup "$SELF" _drain "$1" "$2" >> "$STATE_DIR/drain.log" 2>&1 9>&- < /dev/null &
}

# roll_to <color> <image> <old_container> <old_port>
roll_to() {
  local new="$1" image="$2" old_name="$3" old_port="$4"
  local new_port new_container prev_image n
  new_port="$(port_of "$new")"
  new_container="leetcot-app-$new"
  prev_image="$(get_image "$new")"

  if [ "$(container_state "$new_container")" = running ]; then
    n="$(active_conns "$new_port")"
    if [ "$n" -gt 0 ] && [ "$prev_image" != "$image" ]; then
      die "$new_container is still draining $n connection(s) from the previous deploy; retry later (see $STATE_DIR/drain.log)"
    fi
  fi

  log "starting $new_container from $image"
  set_image "$new" "$image"
  if ! dc up -d --no-deps "app-$new" >&2; then
    set_image "$new" "$prev_image"
    die "could not start $new_container; still serving the old version"
  fi

  if ! wait_healthy "$new"; then
    dk logs --tail 60 "$new_container" >&2 || true
    dk rm -f "$new_container" >/dev/null 2>&1 || true
    set_image "$new" "$prev_image"
    die "new version is not healthy; still serving the old version"
  fi

  log "switching nginx to :$new_port"
  if ! switch_upstream "$new_port"; then
    dk rm -f "$new_container" >/dev/null 2>&1 || true
    set_image "$new" "$prev_image"
    die "switch failed; still serving the old version"
  fi
  log "now serving from $new_container"

  start_drain "$old_name" "$old_port"
}

prune_images() {
  local keep img
  keep=" $(get_image blue) $(get_image green) "
  while read -r img; do
    [ -n "$img" ] || continue
    case "$keep" in *" $img "*) continue ;; esac
    dk rmi "$img" >/dev/null 2>&1 && log "removed old image $img" || true
  done < <(dk images --format '{{.Repository}}:{{.Tag}}' "$IMAGE_REPO" 2>/dev/null)
}

cmd_deploy() {
  local pull=0 allow_dirty=0 runner=0 arg
  for arg in "$@"; do
    case "$arg" in
      --pull) pull=1 ;;
      --allow-dirty) allow_dirty=1 ;;
      --runner) runner=1 ;;
      *) die "unknown option: $arg" ;;
    esac
  done

  exec 9> "$STATE_DIR/lock"
  flock -n 9 || die "another deploy is already running"

  if (( pull )); then
    log "fast-forwarding to origin"
    git fetch --quiet origin
    git merge --ff-only '@{u}' >&2
  fi
  if [ -n "$(git status --porcelain)" ] && (( ! allow_dirty )); then
    die "working tree has uncommitted changes (commit them, or pass --allow-dirty)"
  fi

  local sha image cur_port cur new legacy=0 old_name
  sha="$(git rev-parse --short=10 HEAD)"
  image="$IMAGE_REPO:$sha"
  dk volume create "$FLAGS_VOLUME" >/dev/null

  cur_port="$(active_port)"
  cur="$(color_of_port "$cur_port")"
  new="$(other_color "$cur")"
  if dk inspect "$LEGACY_CONTAINER" >/dev/null 2>&1; then legacy=1; fi

  if (( legacy )); then
    if [ "$new" = blue ]; then
      die "legacy container $LEGACY_CONTAINER still holds :$BLUE_PORT; wait for its drain to finish (see $STATE_DIR/drain.log)"
    fi
    # keep the old image reachable for rollbacks even though the compat tag is about to move
    dk tag "$(dk inspect -f '{{.Image}}' "$LEGACY_CONTAINER")" "$IMAGE_REPO:legacy"
    set_image blue "$IMAGE_REPO:legacy"
    old_name="$LEGACY_CONTAINER"
  else
    old_name="leetcot-app-$cur"
  fi

  if dk image inspect "$image" >/dev/null 2>&1; then
    log "image $image already exists, skipping build"
  else
    log "building $image (this takes a few minutes; the site keeps serving)"
    dk build -t "$image" -t "$COMPAT_TAG" . >&2 || die "image build failed; nothing was changed"
  fi

  roll_to "$new" "$image" "$old_name" "$cur_port"

  if (( runner )); then
    log "refreshing code-runner"
    dk tag "$image" "$COMPAT_TAG"
    dc up -d --no-deps code-runner >&2
  fi
  prune_images
  log "deploy of $sha finished; $old_name drains in the background (tail -f $STATE_DIR/drain.log)"
}

cmd_rollback() {
  exec 9> "$STATE_DIR/lock"
  flock -n 9 || die "another deploy is already running"

  local cur_port cur prev image legacy=0 old_name
  cur_port="$(active_port)"
  cur="$(color_of_port "$cur_port")"
  prev="$(other_color "$cur")"
  image="$(get_image "$prev")"
  [ -n "$image" ] || die "no previous image recorded for $prev; nothing to roll back to"
  dk image inspect "$image" >/dev/null 2>&1 || die "previous image $image no longer exists"
  if dk inspect "$LEGACY_CONTAINER" >/dev/null 2>&1; then legacy=1; fi
  if (( legacy )) && [ "$prev" = blue ]; then
    # the previous version is the pre-blue/green container, which is still running its drain window
    [ "$(container_state "$LEGACY_CONTAINER")" = running ] || die "legacy container $LEGACY_CONTAINER is not running; cannot roll back to it"
    log "rolling back to the legacy container"
    switch_upstream "$BLUE_PORT" || die "switch failed; nothing changed"
    start_drain "leetcot-app-$cur" "$cur_port"
    return 0
  fi
  old_name="leetcot-app-$cur"
  log "rolling back to $prev ($image)"
  roll_to "$prev" "$image" "$old_name" "$cur_port"
}

cmd_status() {
  local p
  p="$(active_port)"
  echo "active: $(color_of_port "$p") (:$p)"
  echo "blue  image: $(get_image blue)"
  echo "green image: $(get_image green)"
  echo
  dk ps -a --filter name=leetcot-app --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}'
  echo
  echo "open connections  blue(:$BLUE_PORT): $(active_conns "$BLUE_PORT")   green(:$GREEN_PORT): $(active_conns "$GREEN_PORT")"
  if [ -s "$STATE_DIR/drain.log" ]; then
    echo
    echo "--- last drain log ---"
    tail -n 5 "$STATE_DIR/drain.log"
  fi
}

case "${1:-deploy}" in
  deploy) shift || true; cmd_deploy "$@" ;;
  rollback) cmd_rollback ;;
  status) cmd_status ;;
  _drain) drain_and_stop "$2" "$3" ;;
  -h|--help|help) sed -n '2,25p' "$SELF" ;;
  --*) cmd_deploy "$@" ;;
  *) die "unknown command '$1' (deploy | rollback | status)" ;;
esac
