# Как открыть Pull Request

## Предварительные требования

- Node.js 20+
- pnpm
- PostgreSQL (локально или через Docker Compose)
- Docker (для code-runner)

## Шаги для локального тестирования

```bash
# 1. Установка зависимостей
pnpm install

# 2. Запуск БД (если через Docker)
docker compose up -d db

# 3. Применение миграций и сидирование
pnpm db:seed:all

# 4. Запуск дев-сервера
pnpm dev
```

## Что проверять перед PR

1. **Seed 2026:**
   ```bash
   pnpm db:seed:oge
   ```

2. **Seed 2027:**
   ```bash
   pnpm db:seed:oge2027
   ```

3. **Страницы:**
   - `/courses/oge-informatika-2026` — лендинг 2026
   - `/courses/oge-informatika-2027` — лендинг 2027
   - `/oge/modules/oge-2027-theory` — модуль 2027 с задачами
   - `/oge/robot-simulator` — тренажёр Робота

4. **Типовая проверка:**
   - Открыть модуль 2027 → увидеть уроки и задания
   - Открыть задание → ввести ответ → получить результат
   - Открыть тренажёр Робота → написать алгоритм → выполнить

## Открытие PR

```bash
# 1. Создать ветку
git checkout -b feature/oge-2027-course

# 2. Добавить файлы
git add packages/db/seed/data/oge-informatika-2027.ts
git add packages/db/seed/oge-course-2027.ts
git add packages/db/seed/data/courses.ts
git add packages/db/seed/data/tracks.ts
git add apps/web/src/app/courses/\[slug\]/page.tsx
git add apps/web/src/app/oge/robot-simulator/
git add apps/web/src/components/oge/robot-simulator.tsx
git add apps/web/src/components/Navigation/index.tsx
git add apps/web/src/app/oge/page.tsx
git add apps/web/src/app/oge/modules/\[slug\]/page.tsx
git add apps/web/src/app/tracks/\[slug\]/page.tsx
git add content/oge-informatika/

# 3. Коммит
git commit -m "feat: add OGE 2027 course with expanded task bank and Robot simulator"

# 4. Пуш
git push origin feature/oge-2027-course

# 5. PR через GitHub CLI
gh pr create \
  --title "Курс ОГЭ 2027: расширенный банк заданий + тренажёр Робота" \
  --body "## Что сделано

### Курс ОГЭ 2027
- 4 модуля по разделам кодификатора ФИПИ
- ~100 заданий, покрывающих все 16 номеров КИМ
- 8–10 заданий на каждый номер (цель: 15–20)
- Новый лендинг курса с динамическим годом

### Тренажёр «Робот» (задание 15)
- Интерактивный браузерный симулятор исполнителя
- Поле 10×10 со стенами
- Поддержка циклов (нц пока, нц N раз) и условий
- Пошаговое выполнение, пауза, сброс
- Быстрая вставка команд

### Инфраструктура
- Новые треки: oge-2027-digital-lit, oge-2027-theory, oge-2027-algo-prog, oge-2027-it
- Seed-скрипт: pnpm db:seed:oge2027
- Обновлена навигация (ссылки на оба курса)
- Обновлён редирект OGE-треков

## Статус ФИПИ 2027
Материалы ещё не опубликованы. Структура приравнена к 2026. При публикации — повторная сверка.

## Как тестировать
см. content/oge-informatika/PR_TEMPLATE.md"
```
