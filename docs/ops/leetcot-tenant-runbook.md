# LeetCot tenant runbook

This is the safe manual process for creating a separate `x.leetcot.ru` instance.

## Target shape

Each tenant should get its own Kubernetes namespace and isolated runtime:

- namespace: `leetcot-<tenant>`
- host: `<tenant>.leetcot.ru`
- app deployment: `leetcot-app`
- code runner deployment: `leetcot-code-runner`
- postgres: separate PVC/database for this tenant
- redis: separate Redis instance for this tenant queue
- secrets: separate `leetcot-env`
- ingress: only for `<tenant>.leetcot.ru`

Do not share production Redis queues or production database between tenants.

## DNS prerequisite

Prefer one wildcard record:

```text
*.leetcot.ru A 37.18.74.251
```

If wildcard DNS is not enabled, create the exact record:

```text
<tenant>.leetcot.ru A 37.18.74.251
```

## Safe creation steps

1. Pick a lowercase tenant slug:

   ```bash
   TENANT=demo
   NS=leetcot-demo
   HOST=demo.leetcot.ru
   IMAGE=ghcr.io/someoneunlicensed/leetcot:<tag>
   ```

2. Create namespace:

   ```bash
   sudo k3s kubectl create namespace "$NS"
   ```

3. Copy required image pull secret from production:

   ```bash
   sudo k3s kubectl -n production get secret ghcr-pull -o yaml \
     | sed "s/namespace: production/namespace: $NS/" \
     | sudo k3s kubectl apply -n "$NS" -f -
   ```

4. Create a separate env secret. Use fresh values for at least:

   - `DATABASE_URL`
   - `DIRECT_URL`
   - `NEXTAUTH_SECRET`
   - `AUTH_SECRET`
   - `ALTCHA_HMAC_KEY`
   - `REDIS_URL`
   - SMTP/contact values

   Never reuse production database URLs for a tenant.

5. Deploy tenant Postgres and Redis in the tenant namespace.

6. Deploy app and code-runner using the selected image.

7. Apply ingress for `$HOST`.

8. Run database migrations inside the tenant app pod:

   ```bash
   POD=$(sudo k3s kubectl -n "$NS" get pod -l app=leetcot-app -o jsonpath='{.items[0].metadata.name}')
   sudo k3s kubectl -n "$NS" exec "$POD" -- pnpm --filter @repo/db exec prisma migrate deploy
   ```

9. Seed/sync tenant content:

   ```bash
   sudo k3s kubectl -n "$NS" exec "$POD" -- pnpm --filter @repo/db exec tsx ./seed/content.ts
   sudo k3s kubectl -n "$NS" exec "$POD" -- pnpm --filter @repo/db exec tsx ./seed/sync-tests.ts
   ```

10. Smoke check:

    ```bash
    curl -I "https://$HOST"
    sudo k3s kubectl -n "$NS" get pods
    ```

## Runner sizing baseline

Start conservative:

- `CODE_RUNNER_CONCURRENCY=2`
- app limit: `cpu=1`, `memory=1Gi`
- runner limit: `cpu=1`, `memory=512Mi`, `ephemeral-storage=2Gi`
- KEDA max replicas: `3`

Increase only after checking:

```bash
sudo k3s kubectl top pods -n "$NS"
df -h /
sudo docker system df
```

## Preferred future automation

The good long-term path is GitOps, not a direct mutable admin panel:

1. Helm chart or Kustomize base for LeetCot.
2. One values file per tenant.
3. GitHub Actions workflow `Deploy Tenant`.
4. Optional admin UI that creates a PR or triggers the workflow.

That gives review, rollback, audit history, and avoids an admin button accidentally mutating the cluster directly.
