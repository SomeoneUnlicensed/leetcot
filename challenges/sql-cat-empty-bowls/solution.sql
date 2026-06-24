-- Напишите ваш SQL-запрос ниже
SELECT place, COALESCE(dish, 'пусто') AS dish_name
FROM bowls
WHERE dish IS NULL
ORDER BY id;
