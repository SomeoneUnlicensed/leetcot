-- Напишите ваш SQL-запрос ниже
SELECT item
FROM pantry
WHERE date(expires_at) < date('2026-06-24')
ORDER BY expires_at;
