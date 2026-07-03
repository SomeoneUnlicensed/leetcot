SELECT bowl, COALESCE(keeper, 'дежурный кот') AS keeper
FROM bowls
ORDER BY bowl;
