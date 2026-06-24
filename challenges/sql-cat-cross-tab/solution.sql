-- Напишите ваш SQL-запрос ниже
SELECT cat,
  SUM(CASE WHEN shift = 'day' THEN fish_count ELSE 0 END) AS day_fish,
  SUM(CASE WHEN shift = 'night' THEN fish_count ELSE 0 END) AS night_fish
FROM shifts
GROUP BY cat
ORDER BY cat;
