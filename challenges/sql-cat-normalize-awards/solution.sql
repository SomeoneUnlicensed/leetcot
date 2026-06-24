-- Напишите ваш SQL-запрос ниже
UPDATE awards
SET tier = CASE
  WHEN points >= 100 THEN 'gold'
  WHEN points >= 50 THEN 'silver'
  ELSE 'bronze'
END;
