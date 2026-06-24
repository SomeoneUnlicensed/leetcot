SELECT name, COUNT(*) AS count
FROM cats
GROUP BY name
HAVING COUNT(*) > 1
ORDER BY count DESC;
