SELECT cats.name, SUM(meals.fish_count) AS total_fish
FROM cats
JOIN meals ON cats.id = meals.cat_id
GROUP BY cats.id, cats.name
ORDER BY total_fish DESC;
