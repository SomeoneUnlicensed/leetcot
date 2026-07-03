SELECT
  cat,
  fish_count,
  DENSE_RANK() OVER (ORDER BY fish_count DESC) AS place
FROM catches
ORDER BY place, cat;
