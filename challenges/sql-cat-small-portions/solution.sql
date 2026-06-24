-- Напишите ваш SQL-запрос ниже
SELECT kitten, grams
FROM portions
WHERE food = 'рыба' AND grams BETWEEN 20 AND 60
ORDER BY grams ASC;
