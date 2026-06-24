-- Напишите ваш SQL-запрос ниже
INSERT INTO audit_log (cat, amount)
SELECT cat, amount
FROM purchases
WHERE amount >= 100;
