-- Напишите ваш SQL-запрос ниже
SELECT cat, COUNT(*) AS duplicates
FROM applications
GROUP BY cat
HAVING COUNT(*) > 1
ORDER BY cat;
