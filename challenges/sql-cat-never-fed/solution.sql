-- Напишите ваш SQL-запрос ниже
SELECT cats.name
FROM cats
LEFT JOIN feedings ON feedings.cat_id = cats.id
WHERE feedings.id IS NULL
ORDER BY cats.id;
