-- Напишите ваш SQL-запрос ниже
SELECT day, points - COALESCE(LAG(points) OVER (ORDER BY day), points) AS diff
FROM trainings
ORDER BY day;
