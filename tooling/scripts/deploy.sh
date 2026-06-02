#!/bin/bash

# Скрипт деплоя ЛитКот "Алгоритмическая Рыбалка" 🐾
# Использование: ./deploy.sh [email] [password]

set -e

echo "🚀 Начинаем деплой ЛитКот..."

# 1. Проверка наличия .env
if [ ! -f .env ]; then
    echo "❌ Ошибка: Файл .env не найден в текущей директории!"
    exit 1
fi

# 2. Сборка и запуск контейнеров
echo "📦 Сборка Docker образов..."
docker compose pull
docker compose up -d --build

# 3. Ожидание готовности БД
echo "⏳ Ожидание готовности базы данных..."
sleep 5

# 4. Применение миграций Prisma
echo "🔄 Применение миграций БД..."
docker compose exec -T app npx prisma db push --accept-data-loss

# 5. Сидирование данных (если переданы аргументы)
if [ ! -z "$1" ] && [ ! -z "$2" ]; then
    echo "🌱 Запуск сидирования (Админ: $1)..."
    docker compose exec -T app pnpm db:seed -- --email="$1" --password="$2"
else
    echo "⚠️ Пропуск сидирования (аргументы email/password не переданы)"
fi

# 6. Очистка старых образов
echo "🧹 Очистка неиспользуемых Docker образов..."
docker image prune -f

echo "✅ Деплой успешно завершен! Мяу! 🐈"
