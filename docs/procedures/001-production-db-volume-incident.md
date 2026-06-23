# Production Database Volume Incident Report

## Summary

A production deployment resulted in the application connecting to an empty PostgreSQL data volume. The database service was reachable and migrations were applied successfully, but application data such as challenges, users, courses, and tracks was missing from the UI.

No data was lost. The original Docker volume still existed and contained the expected production data. Service was restored by switching the PostgreSQL container back to the original volume.

## Impact

- The website loaded, but data-backed pages appeared empty.
- Authentication and application startup were not the primary failure.
- The incident was caused by the database container using the wrong persistent volume.

## Root Cause

The running PostgreSQL container was attached to a newly created empty Docker volume instead of the existing production data volume. The old volume still contained the expected records.

This can happen when a Docker Compose project is recreated from a different working directory, project name, or partially manual container setup. Compose-managed named volumes are often project-scoped, so a path or project-name change can create a different volume name.

## Detection

The issue was confirmed by comparing:

- the volume mounted by the running PostgreSQL container;
- the list of available Docker volumes;
- row counts in the current database;
- row counts in a temporary verification container started from the old volume.

The current database had zero rows in key tables, while the old volume contained the expected production records.

## Resolution

1. Created read-only archive backups of both the current empty volume and the old data volume.
2. Stopped the application container.
3. Stopped and renamed the PostgreSQL container that used the empty volume.
4. Started a Compose-managed PostgreSQL container using the original data volume.
5. Verified row counts for key tables.
6. Ran database migrations and confirmed there were no pending migrations.
7. Started the application container again.
8. Verified the website and data-backed pages returned successful responses.

## Prevention

- Use an explicit Docker volume name for production database storage instead of relying only on Compose's project-scoped default names.
- Keep the Compose project name stable across deploy paths and self-hosted runner work directories.
- Ensure the database container is managed by the active Compose project; it should appear in `docker compose ps`.
- Before replacing or recreating database containers, confirm the mounted volume name.
- Back up production volumes before any container or volume switch.
- Apply migrations only after the database health check passes.
- Deploy the application only after database readiness and migrations succeed.

## Recommended Compose Pattern

For production, prefer a stable external or explicitly named volume:

```yaml
services:
  db:
    volumes:
      - leetcot_postgres_data:/var/lib/postgresql/data

volumes:
  leetcot_postgres_data:
    name: leetcot_postgres_data
```

If the volume already exists, mark it as external:

```yaml
volumes:
  leetcot_postgres_data:
    external: true
```

This prevents accidental volume name changes when the Compose project directory changes.

## Safe Verification Commands

Check which volume PostgreSQL is using:

```sh
docker inspect <db-container> --format '{{range .Mounts}}{{.Name}} -> {{.Destination}}{{println}}{{end}}'
```

Check whether the database is part of the active Compose project:

```sh
docker compose ps
```

Check high-level row counts:

```sh
docker compose exec -T db psql -U postgres -d <database> -Atc \
  'select count(*) from "Challenge";'
```

## Notes

Do not delete old database volumes during incident response. Rename containers and preserve volumes until backups and data verification are complete.
