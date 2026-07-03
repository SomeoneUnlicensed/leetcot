import random

vip_names = ['Барсик', 'Рыжик', 'Пушок']
regular_names = ['Мурка', 'Снежок', 'Дымка', 'Патч', 'Линт']
dishes = ['тунец', 'лосось', 'сардина', 'форель', 'креветки', 'окунь']

rows = []
row_id = 1
for name in vip_names:
    rows.append((row_id, name, random.choice(dishes)))
    row_id += 1

n_regular = random.randint(2, 4)
for name in random.sample(regular_names, n_regular):
    rows.append((row_id, name, random.choice(dishes)))
    row_id += 1

random.shuffle(rows)
# Re-number ids sequentially after shuffling so ORDER BY id stays meaningful
rows = [(i + 1, name, dish) for i, (_, name, dish) in enumerate(rows)]

values = ', '.join(f"({rid}, '{name}', '{dish}')" for rid, name, dish in rows)
GENERATED_SEED = f"INSERT INTO orders (id, cat, dish) VALUES {values};"
