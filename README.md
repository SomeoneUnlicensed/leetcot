# ЛитКот (LitKot)

A coding practice platform: programming challenges, courses, and interactive exercises.

This is proprietary software. See [LICENSE](./LICENSE).

## Local development

### Option A: Docker Compose

```sh
docker compose up -d
```

This starts Postgres, Redis, pgAdmin (`localhost:5050`), and the app (`localhost:3002`).

### Option B: Dev Container

Open the repo in VS Code (or any [Dev Containers](https://containers.dev/)-compatible editor) and reopen in container — see [`.devcontainer/devcontainer.json`](./.devcontainer/devcontainer.json).

### Then

```sh
pnpm install
pnpm db:push
pnpm db:seed
pnpm dev
```

