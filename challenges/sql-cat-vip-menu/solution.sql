-- Напишите ваш SQL-запрос ниже
SELECT cat, dish
FROM orders
WHERE cat IN ('Барсик', 'Рыжик', 'Пушок')
ORDER BY id;
