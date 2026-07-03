import random

names = ['Барсик', 'Мурка', 'Патч', 'Рыжик', 'Снежок']
random.shuffle(names)
dup_names = names[:2]
unique_names = names[2:4]

rows = []
row_id = 1
for name in dup_names:
    for _ in range(random.randint(2, 3)):
        rows.append((row_id, name, f'{name.lower()}@mail'))
        row_id += 1
for name in unique_names:
    rows.append((row_id, name, f'{name.lower()}@mail'))
    row_id += 1

random.shuffle(rows)
rows = [(i + 1, name, email) for i, (_, name, email) in enumerate(rows)]

values = ', '.join(f"({rid}, '{name}', '{email}')" for rid, name, email in rows)
GENERATED_SEED = f"INSERT INTO applications (id, cat, email) VALUES {values};"
