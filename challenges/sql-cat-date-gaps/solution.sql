SELECT
  cat,
  MAX(fed_at) AS last_fed_at,
  CAST(julianday('2026-06-25') - julianday(MAX(fed_at)) AS INTEGER) AS days_since_last
FROM feedings
GROUP BY cat
ORDER BY cat;
