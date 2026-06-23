FROM node:24-alpine AS base
RUN apk add --no-cache openssl docker-cli && \
    npm install -g pnpm@10.11.0 dotenv-cli
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/admin/package.json ./apps/admin/package.json

COPY apps/auth-proxy/package.json ./apps/auth-proxy/package.json
COPY apps/code-runner/package.json ./apps/code-runner/package.json
COPY apps/og-image/package.json ./apps/og-image/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/auth/package.json ./packages/auth/package.json
COPY packages/code-runner/package.json ./packages/code-runner/package.json
COPY packages/db/package.json ./packages/db/package.json
COPY packages/monaco/package.json ./packages/monaco/package.json
COPY packages/og-utils/package.json ./packages/og-utils/package.json
COPY packages/redis/package.json ./packages/redis/package.json
COPY packages/ui/package.json ./packages/ui/package.json
COPY tooling/config-eslint/package.json ./tooling/config-eslint/package.json
COPY tooling/config-tailwind/package.json ./tooling/config-tailwind/package.json
COPY tooling/config-typescript/package.json ./tooling/config-typescript/package.json
COPY tooling/github-actions/package.json ./tooling/github-actions/package.json
COPY tooling/scripts/package.json ./tooling/scripts/package.json
COPY patches ./patches
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm config set store-dir /pnpm/store && pnpm install

FROM deps AS builder
COPY . .
ARG NEXT_PUBLIC_SENTRY_DSN
ARG SENTRY_ORG
ARG SENTRY_PROJECT
ENV DATABASE_URL="postgresql://postgres:dev@localhost:5432/leetcot?schema=public"
ENV NODE_OPTIONS="--max-old-space-size=3072"
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
RUN --mount=type=secret,id=sentry_auth_token \
    SENTRY_AUTH_TOKEN="$(cat /run/secrets/sentry_auth_token 2>/dev/null || true)" \
    npx turbo run build --concurrency=1

RUN find /app/node_modules -name "*.map" -delete && \
    find /app/node_modules -name "*.d.ts" -delete && \
    find /app/node_modules/.cache -mindepth 1 -delete 2>/dev/null || true && \
    find /app -path "*/.next/cache" -type d -exec rm -rf {} + 2>/dev/null || true

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app ./

EXPOSE 3000 3001 3003

RUN printf '#!/bin/sh\nset -e\nfor i in $(seq 1 30); do\n  echo "Applying database migrations... attempt $i/30"\n  if pnpm --filter @repo/db exec prisma migrate deploy; then\n    echo "Database migrations applied."\n    break\n  fi\n  if [ "$i" -eq 30 ]; then\n    echo "Database migrations failed after 30 attempts."\n    exit 1\n  fi\n  sleep 2\ndone\necho "Starting LeetCot in production mode..."\npnpm start\n' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]
