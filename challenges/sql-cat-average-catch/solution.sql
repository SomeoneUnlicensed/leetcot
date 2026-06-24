-- Напишите ваш SQL-запрос ниже
SELECT team, ROUND(AVG(fish_count), 1) AS avg_fish
FROM catches
GROUP BY team
ORDER BY avg_fish DESC;
