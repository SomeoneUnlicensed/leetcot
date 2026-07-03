import random

fish_types = ['Сёмга', 'Треска', 'Тунец', 'Карп', 'Лосось', 'Скумбрия']
random.shuffle(fish_types)
chosen = fish_types[: random.randint(4, 6)]

rows = []
for i, fish in enumerate(chosen):
    tier = 'premium' if random.random() < 0.5 else 'standard'
    price = round(random.uniform(20, 250), 2)
    rows.append((i + 1, fish, price, tier))

# Guarantee both tiers are represented.
tiers = {tier for _, _, _, tier in rows}
if 'premium' not in tiers:
    rid, fish, price, _ = rows[0]
    rows[0] = (rid, fish, price, 'premium')
if 'standard' not in tiers:
    rid, fish, price, _ = rows[-1]
    rows[-1] = (rid, fish, price, 'standard')

values = ', '.join(f"({rid},'{fish}',{price},'{tier}')" for rid, fish, price, tier in rows)
GENERATED_SEED = f"INSERT INTO prices VALUES {values};"
