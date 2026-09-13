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
                        # AUTH_URL/NEXTAUTH_URL (реальный домен), ALTCHA_HMAC_KEY
docker compose up -d --build
```

`--build` обязателен хотя бы один раз: `app`/`code-runner` по умолчанию
ссылаются на образ из GHCR основного продукта, а `build:` в
`docker-compose.yaml` указывает собрать его из этого же чекаута вместо
скачивания чужого образа.

При старте контейнера `app` (`entrypoint.sh`) автоматически:

1. накатывает миграции (`prisma migrate deploy`, с ретраями, пока БД поднимается);
2. сидирует чемпионат и 20 задач debug-simulator;
3. билдит все 20 docker-образов задач из `challenges/docker/*/` (нужен
   смонтированный `/var/run/docker.sock` — уже прописан в compose);
4. запускает само приложение.

Ручного шага сидирования/сборки образов не требуется — если контейнер
поднялся и открывается `https://<домен>/login`, значит всё сработало.

