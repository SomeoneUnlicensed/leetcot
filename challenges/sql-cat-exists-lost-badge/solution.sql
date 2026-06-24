-- Напишите ваш SQL-запрос ниже
SELECT name
FROM cats
WHERE EXISTS (
  SELECT 1 FROM medals WHERE medals.cat_id = cats.id
)
ORDER BY id;
