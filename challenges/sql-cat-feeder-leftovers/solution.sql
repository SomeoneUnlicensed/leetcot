-- Напишите ваш SQL-запрос ниже
SELECT feeders.name, COALESCE(leftovers.grams, 0) AS grams_left
FROM feeders
LEFT JOIN leftovers ON leftovers.feeder_id = feeders.id
ORDER BY feeders.id;
