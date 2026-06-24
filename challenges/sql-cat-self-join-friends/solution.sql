-- Напишите ваш SQL-запрос ниже
SELECT kitten.name AS kitten, mentor.name AS mentor
FROM cats AS kitten
JOIN cats AS mentor ON mentor.id = kitten.mentor_id
ORDER BY kitten.id;
