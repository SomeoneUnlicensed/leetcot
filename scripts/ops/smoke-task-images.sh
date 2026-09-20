#!/usr/bin/env bash
# Starts every task image exactly the way the app does (task-container.sh: no network, 256m,
# 0.5 cpu, 128 pids, no-new-privileges, the same extra capabilities, flag handed over as a
# one-shot file) and checks that it comes up and stays up, that the in-shell `submit` helper
# installs and works, and that the image's entrypoint really consumed the flag hand-off file.
# (Whether the flag leaks to participants is scan-flag-leaks.sh's job.)
#
#   scripts/ops/smoke-task-images.sh            # all lentatech/* images
#   scripts/ops/smoke-task-images.sh network-scan   # a single task
#
# Test containers are named smoke-* and carry no lentatech.app label, so neither the app nor the
# orphan reaper ever touches them; they are removed at the end.
set -Eeuo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/ops/task-container.sh
source "$HERE/task-container.sh"

FLAG_VALUE="LENTA{smoke_test_0000}"

# Same command the app pipes into `docker exec` (installSubmitHelper in environments.ts).
read -r -d '' INSTALL_SUBMIT <<'EOS' || true
cat > /usr/local/bin/submit <<'SUBMIT_EOF'
#!/bin/sh
printf '===SUBMIT:%s===\n' "$1"
SUBMIT_EOF
chmod +x /usr/local/bin/submit
EOS

if [ "$#" -gt 0 ]; then
  slugs=("$@")
else
  mapfile -t slugs < <(all_task_slugs)
fi

pass=0
fail=0
for slug in "${slugs[@]}"; do
  name="smoke-$slug-$$"
  problems=()

  if ! start_task_container "$name" "$slug" "$FLAG_VALUE" 2> /dev/null; then
    problems+=("container could not be created/started")
  else
    sleep 3
    state="$(docker inspect -f '{{.State.Status}}' "$name")"
    [ "$state" = running ] || problems+=("container is '$state' after 3s")
    if [ "$state" = running ]; then
      docker exec "$name" sh -c "$INSTALL_SUBMIT" > /dev/null 2>&1 || problems+=("submit helper install failed")
      out="$(docker exec "$name" submit abc 2>&1 || true)"
      [ "$out" = "===SUBMIT:abc===" ] || problems+=("submit helper output unexpected: $out")
      if docker exec "$name" sh -c "test -e $FLAG_HANDOFF_PATH" > /dev/null 2>&1; then
        problems+=("flag hand-off file still present - entrypoint did not consume it")
      fi
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
