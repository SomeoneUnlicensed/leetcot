SELECT cats.id, cats.name
FROM cats
LEFT JOIN awards ON cats.id = awards.cat_id
WHERE awards.id IS NULL
ORDER BY cats.id;
