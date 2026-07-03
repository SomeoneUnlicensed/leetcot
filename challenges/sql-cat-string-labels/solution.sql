SELECT cat, cat || ' — ' || carrier_color AS label
FROM cats
ORDER BY cat;
