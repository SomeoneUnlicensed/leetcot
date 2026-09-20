#!/bin/sh
set -e

for i in $(seq 1 30); do
  echo "Applying database migrations... attempt $i/30"
  if pnpm --filter @repo/db exec prisma migrate deploy; then
    echo "Database migrations applied."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "Database migrations failed after 30 attempts."
    exit 1
  fi
  sleep 2
done

echo "Seeding debug-simulator content..."
pnpm --filter @repo/db db:seed:debug-simulator
echo "Debug-simulator content seeded."

if [ -S /var/run/docker.sock ]; then
  echo "Checking debug-simulator task environment images..."
  for dir in /app/challenges/docker/*/; do
    [ -d "$dir" ] || continue
    slug="$(basename "$dir")"
    # Rebuild only when the task's sources changed: the image carries a hash of them as a label.
    src_hash="$(cd "$dir" && find . -type f | sort | xargs sha256sum | sha256sum | cut -c1-16)"
    built_hash="$(docker image inspect -f '{{index .Config.Labels "lentatech.src-hash"}}' "lentatech/$slug:latest" 2>/dev/null || true)"
    if [ "$built_hash" = "$src_hash" ]; then
      echo "lentatech/$slug:latest is up to date, skipping."
      continue
    fi
    echo "Building lentatech/$slug:latest (sources changed)"
    docker build --label "lentatech.src-hash=$src_hash" -t "lentatech/$slug:latest" "$dir" || echo "WARNING: failed to build $slug, skipping."
  done
else
  echo "No docker.sock mounted, skipping debug-simulator environment image builds."
fi

echo "Starting LeetCot in production mode..."
exec pnpm start
