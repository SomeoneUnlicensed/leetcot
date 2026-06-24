-- Напишите ваш SQL-запрос ниже
SELECT cats.name, COUNT(meals.id) AS meal_count
FROM cats
LEFT JOIN meals ON meals.cat_id = cats.id
GROUP BY cats.id, cats.name
ORDER BY meal_count DESC, cats.id;
