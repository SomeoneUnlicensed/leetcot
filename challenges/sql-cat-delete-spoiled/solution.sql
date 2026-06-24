-- Напишите ваш SQL-запрос ниже
DELETE FROM pantry
WHERE date(expires_at) < date('2026-06-24');
