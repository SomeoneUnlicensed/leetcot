-- Напишите ваш SQL-запрос ниже
SELECT name, weight
FROM fishes
WHERE weight > (SELECT AVG(weight) FROM fishes)
ORDER BY weight DESC;
