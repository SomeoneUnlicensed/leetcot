-- Напишите ваш SQL-запрос ниже
SELECT cat, medals, RANK() OVER (ORDER BY medals DESC) AS place
FROM scores
ORDER BY place, cat;
