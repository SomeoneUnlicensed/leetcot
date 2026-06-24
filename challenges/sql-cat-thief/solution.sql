-- Напишите ваш SQL-запрос ниже
SELECT c.name 
FROM action_logs al
JOIN cats c ON al.cat_id = c.id
WHERE al.action = 'stole_sausage'
ORDER BY al.created_at DESC
LIMIT 1;
