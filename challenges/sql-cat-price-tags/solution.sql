-- Напишите ваш SQL-запрос ниже
SELECT fish,
  CASE
    WHEN price < 80 THEN 'дешево'
    WHEN price <= 150 THEN 'обычно'
    ELSE 'дорого'
  END AS price_level
FROM market
ORDER BY price;
