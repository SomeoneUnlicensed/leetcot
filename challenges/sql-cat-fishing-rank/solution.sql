SELECT cats.name, COUNT(*) AS times_fished, ROUND(AVG(catches.fish_count), 1) AS avg_catch
FROM cats
JOIN catches ON cats.id = catches.cat_id
GROUP BY cats.id, cats.name
HAVING COUNT(*) >= 3
ORDER BY avg_catch DESC;
