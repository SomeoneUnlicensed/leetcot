-- Напишите ваш SQL-запрос ниже
SELECT channel, ROUND(1.0 * signups / NULLIF(visits, 0), 2) AS conversion
FROM funnels
ORDER BY conversion DESC NULLS LAST;
