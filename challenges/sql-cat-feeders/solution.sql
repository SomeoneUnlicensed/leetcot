-- Напишите ваш SQL-запрос ниже
UPDATE feeders 
SET status = 'active' 
WHERE cat_id IN (
  SELECT id FROM cats WHERE name IN ('Мурзик', 'Барсик')
);
