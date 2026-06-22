FROM node:24-alpine AS base
RUN apk add --no-cache openssl docker-cli && \
    npm install -g pnpm@10.11.0 dotenv-cli
WORKDIR /app

FROM base AS deps
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY apps/admin/package.json ./apps/admin/package.json

COPY apps/auth-proxy/package.json ./apps/auth-proxy/package.json
COPY apps/og-image/package.json ./apps/og-image/package.json
COPY apps/web/package.json ./apps/web/package.json
COPY packages/auth/package.json ./packages/auth/package.json
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
ENV DATABASE_URL="postgresql://postgres:dev@localhost:5432/leetcot?schema=public"
ENV NODE_OPTIONS="--max-old-space-size=3072"
RUN npx turbo run build --concurrency=1

RUN find /app/node_modules -name "*.map" -delete && \
    find /app/node_modules -name "*.d.ts" -delete && \
    find /app/node_modules/.cache -mindepth 1 -delete 2>/dev/null || true && \
    find /app -path "*/.next/cache" -type d -exec rm -rf {} + 2>/dev/null || true

FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app ./

EXPOSE 3000 3001 3003

RUN printf '#!/bin/sh\necho "Applying database migrations..."\npnpm --filter @repo/db exec prisma migrate deploy\necho "Starting LeetCot in production mode..."\npnpm start\n' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]
