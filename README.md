# ЛитКот (leetcot.ru)

A coding practice platform: multi-language code challenges, SQL practice, courses, and interactive exercises.

## Practice Kit

`Practice Kit` is the reusable workspace for tasks with an editor or runner. It gives every
product the same two-panel experience: task text on the left, editor or runner UI on the right,
with the same resizable layout that is used on the main challenge page.

Use it when a product needs a coding workspace without rebuilding the split view again:

- regular code challenges;
- SQL practice screens;
- LitKot Exams code tasks;
- partner practice rooms;
- interview sessions;
- internal sandboxes and demos.

### Import

```tsx
import { PracticeWorkspace } from '~/components/practice-kit';
```

### Basic Usage

```tsx
<PracticeWorkspace
  task={{
    id: challenge.id,
    slug: challenge.slug,
    title: challenge.title,
    language: challenge.language,
    difficulty: challenge.difficulty,
  }}
  left={<TaskStatement challenge={challenge} />}
  right={<CodeRunner challenge={challenge} />}
/>
```

`left` can also be a function when the task statement needs access to panel controls:

```tsx
<PracticeWorkspace
  left={({ collapsePanel, expandPanel, isDesktop }) => (
    <TaskStatement
      challenge={challenge}
      isDesktop={isDesktop}
      onFocusCode={collapsePanel}
      onShowStatement={expandPanel}
    />
  )}
  right={<CodeRunner challenge={challenge} />}
/>
```

### Interview Workspace

For interviews, keep the same kit and swap only the content blocks:

```tsx
<PracticeWorkspace
  isPlayground
  task={{
    id: interviewTask.id,
    slug: interviewTask.slug,
    title: interviewTask.title,
    language: interviewTask.language,
    difficulty: interviewTask.level,
  }}
  left={
    <InterviewPrompt
      title={interviewTask.title}
      prompt={interviewTask.prompt}
      examples={interviewTask.examples}
      constraints={interviewTask.constraints}
      hints={interviewTask.hints}
    />
  }
  right={
    <InterviewCodePanel
      sessionId={session.id}
      taskId={interviewTask.id}
      initialCode={submission.code}
      language={interviewTask.language}
    />
  }
/>
```

Recommended interview page shape:

- route: `apps/web/src/app/interviews/[sessionId]/page.tsx`;
- left panel: prompt, examples, constraints, interviewer notes if needed;
- right panel: Monaco editor, run button, visible tests, hidden evaluation status;
- API: one session endpoint for saving code and one endpoint for running tests;
- data source: reuse the challenge bank first, then add interview-only tasks if the format needs
  longer discussion prompts.

Keep product-specific logic outside `PracticeWorkspace`. The kit owns layout behavior only:
resizing, mobile/desktop layout, left-panel collapse, and panel ordering. Saving code, running tests,
grading, recommendations, and session permissions should stay in the product page or its API layer.

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

## Продакшен-деплой (форк «Дебаг-Симулятор» / Лента tech)

Эта ветка — самостоятельный однохостовый деплой через `docker-compose.yaml`,
**не связанный** с `.github/workflows/deploy.yml` (тот пайплайн катит основной
продукт leetcot.ru в общий k3s-кластер по релизу и не знает про
debug-simulator — не запускайте его для этой ветки, иначе контент
мероприятия попадёт не туда).

На сервере:

```sh
git clone <repo> && cd leetcot
git checkout claude/feed-platform-fork-wk0tu0
cp .env.example .env   # заполните POSTGRES_PASSWORD, NEXTAUTH_SECRET,
                        # AUTH_URL/NEXTAUTH_URL (реальный домен)
docker compose up -d --build
```

`--build` обязателен при первом запуске: `docker-compose.yaml` собирает
`app`/`code-runner` из этого чекаута (`build: context: .`). Если образ ещё
не собран и не задан `LEETCOT_IMAGE`, дефолтный тег —
`ghcr.io/someoneunlicensed/leetcot:debug-simulator` — это **отдельный тег
этого форка**, никак не пересекается с `:latest` основного продукта.

При старте контейнера `app` (`entrypoint.sh`) автоматически:

1. накатывает миграции (`prisma migrate deploy`, с ретраями, пока БД поднимается);
2. сидирует чемпионат и 20 задач debug-simulator;
3. билдит все 20 docker-образов задач из `challenges/docker/*/` (нужен
   смонтированный `/var/run/docker.sock` — уже прописан в compose);
4. запускает само приложение.

Ручного шага сидирования/сборки образов не требуется — если контейнер
поднялся и открывается `https://<домен>/login`, значит всё сработало.

### Обновление через CI (`.github/workflows/deploy-debug-simulator.yml`)

После первого ручного бутстрапа выше — дальнейшие обновления катятся через
отдельный CI-пайплайн (тоже не связан с `deploy.yml` основного продукта):
GitHub Actions собирает образ, пушит его в GHCR под тегом
`ghcr.io/someoneunlicensed/leetcot:debug-simulator`, затем по SSH заходит на
сервер, обновляет чекаут и перезапускает `docker compose` с этим образом.

Запуск — **только вручную**: вкладка Actions → «Deploy Debug Simulator
(Lenta tech)» → Run workflow.

Нужно один раз задать secrets репозитория (Settings → Secrets and variables
→ Actions):

| Secret | Значение |
| --- | --- |
| `DEBUG_SIMULATOR_SSH_HOST` | хост/IP сервера мероприятия |
| `DEBUG_SIMULATOR_SSH_USER` | SSH-пользователь для деплоя |
| `DEBUG_SIMULATOR_SSH_KEY` | приватный SSH-ключ (без пароля) |
| `DEBUG_SIMULATOR_SSH_PORT` | порт SSH (необязательно, по умолчанию 22) |
| `DEBUG_SIMULATOR_DEPLOY_PATH` | путь к чекауту репозитория на сервере (там уже должны быть `docker-compose.yaml` и заполненный `.env` из бутстрапа выше) |

Сервер должен быть залогинен под тем же SSH-пользователем на GHCR или иметь
доступ на `docker pull` из GHCR — воркфлоу логинится сам через
`GITHUB_TOKEN` на шаге деплоя, отдельно настраивать не нужно.

