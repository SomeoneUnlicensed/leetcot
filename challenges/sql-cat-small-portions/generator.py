import random

kittens = ['Пиксель', 'Байт', 'Скрипт', 'Патч', 'Линт', 'Коммит', 'Тег', 'Форк']
random.shuffle(kittens)
chosen = kittens[: random.randint(5, 7)]

rows = []
for i, kitten in enumerate(chosen):
    if random.random() < 0.7:
        food = 'рыба'
        # Mix of in-range (20-60) and out-of-range fish portions.
        grams = random.randint(20, 60) if random.random() < 0.7 else random.choice(
            [random.randint(1, 19), random.randint(61, 100)]
        )
    else:
        food = random.choice(['курица', 'творог', 'индейка'])
        grams = random.randint(20, 60)
    rows.append((i + 1, kitten, food, grams))

values = ', '.join(f"({rid}, '{kitten}', '{food}', {grams})" for rid, kitten, food, grams in rows)
GENERATED_SEED = f"INSERT INTO portions (id, kitten, food, grams) VALUES {values};"
