-- Напишите ваш SQL-запрос ниже
SELECT day, SUM(fish_count) OVER (ORDER BY day) AS total_so_far
FROM daily_catch
ORDER BY day;
