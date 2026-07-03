SELECT
  cat,
  CASE
    WHEN points >= 90 THEN 'золото'
    WHEN points >= 70 THEN 'серебро'
    ELSE 'рыбка'
  END AS league
FROM scores
ORDER BY points DESC;
