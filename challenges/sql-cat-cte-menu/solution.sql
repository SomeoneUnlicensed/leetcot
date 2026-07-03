WITH totals AS (
  SELECT cat, SUM(grams) AS total_grams
  FROM orders
  GROUP BY cat
)
SELECT cat, total_grams
FROM totals
WHERE total_grams >= 300
ORDER BY cat;
