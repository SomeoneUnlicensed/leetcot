#!/usr/bin/env bash
# Starts every task image exactly the way the app does (see runContainer in
# apps/web/src/server/environments.ts: no network, 256m, 0.5 cpu, 128 pids, no-new-privileges,
# the same extra capabilities) and checks that it comes up and stays up, that the per-instance
# FLAG reaches the container, and that the in-shell `submit` helper installs and works.
#
#   scripts/ops/smoke-task-images.sh            # all lentatech/* images
#   scripts/ops/smoke-task-images.sh network-scan   # a single task
#
# Test containers are named smoke-* and carry no lentatech.app label, so neither the app nor the
# orphan reaper ever touches them; they are removed at the end.
set -Eeuo pipefail

FLAG_VALUE="LENTA{smoke_test_0000}"
# Same command the app pipes into `docker exec` (installSubmitHelper in environments.ts).
read -r -d '' INSTALL_SUBMIT <<'EOS' || true
cat > /usr/local/bin/submit <<'SUBMIT_EOF'
#!/bin/sh
printf '===SUBMIT:%s===\n' "$1"
SUBMIT_EOF
chmod +x /usr/local/bin/submit
EOS

declare -A EXTRA_CAPS=(
  [firewall-block-malicious-ip]="NET_ADMIN NET_RAW"
  [traffic-sniffing]="NET_RAW NET_ADMIN"
)

if [ "$#" -gt 0 ]; then
  slugs=("$@")
else
  mapfile -t slugs < <(docker images --format '{{.Repository}}' 'lentatech/*' | sed 's#^lentatech/##' | sort -u)
fi

pass=0
fail=0
for slug in "${slugs[@]}"; do
  name="smoke-$slug-$$"
  caps=()
  for cap in ${EXTRA_CAPS[$slug]:-}; do caps+=(--cap-add "$cap"); done
  problems=()

  if ! docker run -d --name "$name" --init --network none --memory 256m --memory-swap 256m \
      --cpus 0.5 --pids-limit 128 --security-opt no-new-privileges:true "${caps[@]}" \
      -e "FLAG=$FLAG_VALUE" "lentatech/$slug:latest" > /dev/null 2>&1; then
    problems+=("docker run failed")
  else
    sleep 3
    state="$(docker inspect -f '{{.State.Status}}' "$name")"
    [ "$state" = running ] || problems+=("container is '$state' after 3s")
    if [ "$state" = running ]; then
      docker exec "$name" sh -c "$INSTALL_SUBMIT" > /dev/null 2>&1 || problems+=("submit helper install failed")
      out="$(docker exec "$name" submit abc 2>&1 || true)"
      [ "$out" = "===SUBMIT:abc===" ] || problems+=("submit helper output unexpected: $out")
      docker exec "$name" sh -c 'test -n "$FLAG"' > /dev/null 2>&1 || problems+=("FLAG env not visible in a shell")
      if [ "$slug" = restore-sudoers ]; then
        docker exec -u ops "$name" sh -c 'id' > /dev/null 2>&1 || problems+=("user 'ops' missing")
      fi
    else
      docker logs --tail 5 "$name" 2>&1 | sed 's/^/      log: /' || true
    fi
  fi
  docker rm -f "$name" > /dev/null 2>&1 || true

  if [ "${#problems[@]}" -eq 0 ]; then
    echo "PASS  $slug"
    pass=$((pass + 1))
  else
    echo "FAIL  $slug: ${problems[*]}"
    fail=$((fail + 1))
  fi
done

echo "--- $pass passed, $fail failed ---"
[ "$fail" -eq 0 ]
