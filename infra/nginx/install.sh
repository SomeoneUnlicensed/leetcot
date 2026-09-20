#!/usr/bin/env bash
# One-time, idempotent nginx setup for the blue/green deploy (scripts/deploy/deploy.sh).
#
#   infra/nginx/install.sh
#
# - installs the websocket "Connection" map (conf.d/leetcot-map.conf);
# - creates the managed upstream (conf.d/leetcot-upstream.conf, initially the blue instance :3002);
# - patches the site config: proxy_pass -> the upstream, "Connection" -> $connection_upgrade
#   (plain requests no longer claim to be upgrades), X-Forwarded-For -> the real peer address
#   (a client-supplied value would let anyone dodge the per-IP rate limits) and 1h proxy timeouts (nginx's 60s default
#   silently kills idle terminal websockets);
# - adds basic security headers (HSTS for this host only, nosniff, frame and referrer policy, noindex) and
#   hides the nginx version and X-Powered-By;
# - runs `nginx -t` and reloads; restores the previous files if the test fails.
set -Eeuo pipefail

SITE_CONF="${SITE_CONF:-/etc/nginx/sites-available/lenta.leetcot.ru}"
CONF_D="${CONF_D:-/etc/nginx/conf.d}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SUDO=""
[ "$(id -u)" -eq 0 ] || SUDO="sudo"

[ -f "$SITE_CONF" ] || { echo "site config $SITE_CONF not found" >&2; exit 1; }

backup="$(mktemp -d)"
$SUDO cp -a "$SITE_CONF" "$backup/site.conf"
had_map=0
had_upstream=0
if [ -f "$CONF_D/leetcot-map.conf" ]; then had_map=1; $SUDO cp -a "$CONF_D/leetcot-map.conf" "$backup/map.conf"; fi
if [ -f "$CONF_D/leetcot-upstream.conf" ]; then had_upstream=1; $SUDO cp -a "$CONF_D/leetcot-upstream.conf" "$backup/upstream.conf"; fi

restore() {
  echo "nginx test failed - restoring previous configuration" >&2
  $SUDO cp -a "$backup/site.conf" "$SITE_CONF"
  if (( had_map )); then $SUDO cp -a "$backup/map.conf" "$CONF_D/leetcot-map.conf"; else $SUDO rm -f "$CONF_D/leetcot-map.conf"; fi
  if (( had_upstream )); then $SUDO cp -a "$backup/upstream.conf" "$CONF_D/leetcot-upstream.conf"; else $SUDO rm -f "$CONF_D/leetcot-upstream.conf"; fi
}

$SUDO install -m 0644 "$HERE/leetcot-map.conf" "$CONF_D/leetcot-map.conf"

if [ ! -f "$CONF_D/leetcot-upstream.conf" ]; then
  printf '%s\n' \
    '# Managed by scripts/deploy/deploy.sh - do not edit by hand.' \
    'upstream leetcot_app {' \
    '    server 127.0.0.1:3002;' \
    '}' | $SUDO tee "$CONF_D/leetcot-upstream.conf" >/dev/null
fi

$SUDO python3 - "$SITE_CONF" <<'PY'
import sys

path = sys.argv[1]
s = open(path, encoding="utf-8").read()

s = s.replace("proxy_pass http://127.0.0.1:3002;", "proxy_pass http://leetcot_app;")
s = s.replace('proxy_set_header Connection "upgrade";', "proxy_set_header Connection $connection_upgrade;")
s = s.replace(
    "proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;",
    "proxy_set_header X-Forwarded-For $remote_addr;",
)
if "proxy_read_timeout" not in s:
    s = s.replace(
        "proxy_http_version 1.1;",
        "proxy_http_version 1.1;\n        proxy_read_timeout 3600s;\n        proxy_send_timeout 3600s;",
        1,
    )
if "Strict-Transport-Security" not in s:
    s = s.replace(
        "    location / {",
        "    server_tokens off;\n"
        '    add_header Strict-Transport-Security "max-age=15552000" always;\n'
        '    add_header X-Content-Type-Options "nosniff" always;\n'
        '    add_header X-Frame-Options "SAMEORIGIN" always;\n'
        '    add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n'
        "\n"
        "    location / {\n"
        "        proxy_hide_header X-Powered-By;",
        1,
    )
if "X-Robots-Tag" not in s and "add_header Referrer-Policy" in s:
    s = s.replace(
        '    add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n',
        '    add_header Referrer-Policy "strict-origin-when-cross-origin" always;\n'
        '    add_header X-Robots-Tag "noindex, nofollow" always;\n',
        1,
    )
open(path, "w", encoding="utf-8").write(s)
PY

if $SUDO nginx -t; then
  $SUDO systemctl reload nginx
  echo "nginx configured (backup of the previous files: $backup)"
else
  restore
  exit 1
fi
