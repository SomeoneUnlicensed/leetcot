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

echo "Seeding production content..."
pnpm --filter @repo/db db:seed:content
echo "Production content seeded."

if [ -S /var/run/docker.sock ]; then
  echo "Building debug-simulator task environment images..."
  for dir in /app/challenges/docker/*/; do
    [ -d "$dir" ] || continue
    slug="$(basename "$dir")"
    echo "Building lentatech/$slug:latest"
    docker build -t "lentatech/$slug:latest" "$dir" || echo "WARNING: failed to build $slug, skipping."
  done
else
  echo "No docker.sock mounted, skipping debug-simulator environment image builds."
fi

echo "Starting LeetCot in production mode..."
pnpm start
