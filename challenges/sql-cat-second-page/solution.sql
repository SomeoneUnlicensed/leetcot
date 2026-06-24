-- Напишите ваш SQL-запрос ниже
SELECT cat, points
FROM leaderboard
ORDER BY points DESC
LIMIT 2 OFFSET 2;
