-- Напишите ваш SQL-запрос ниже
CREATE TABLE catch_summary AS
SELECT cat, SUM(fish_count) AS total_fish
FROM catches
GROUP BY cat;
