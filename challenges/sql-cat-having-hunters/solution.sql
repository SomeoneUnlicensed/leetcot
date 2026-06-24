-- Напишите ваш SQL-запрос ниже
SELECT hunter, SUM(fish_count) AS total_fish
FROM hunts
GROUP BY hunter
HAVING SUM(fish_count) >= 10
ORDER BY total_fish DESC;
