# --- Stage 1: Base ---
FROM node:24-alpine AS base
RUN apk add --no-cache openssl && \
    npm install -g pnpm@10.11.0 dotenv-cli
WORKDIR /app

# --- Stage 2: Dependencies ---
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
RUN pnpm install

# --- Stage 3: Build ---
FROM deps AS builder
COPY . .
# We need environment variables at build time for Next.js in some cases, 
# but usually it's better to provide them via .env during build if needed.
# Limit concurrency to 1 to prevent OOM kills in Docker
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npx turbo run build --concurrency=1

# --- Stage 4: Production ---
FROM base AS runner
ENV NODE_ENV=production
COPY --from=builder /app ./

# Expose ports for web, admin, aot
EXPOSE 3000 3001 3003

# Production entrypoint
RUN printf '#!/bin/sh\necho "Applying database changes..."\npnpm db:push\necho "Starting LeetCot in production mode..."\npnpm start\n' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

ENTRYPOINT ["/bin/sh", "/app/entrypoint.sh"]
