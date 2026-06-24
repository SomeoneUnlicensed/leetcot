-- Напишите ваш SQL-запрос ниже
SELECT name FROM dry_pantry
UNION
SELECT name FROM cold_pantry
ORDER BY name;
