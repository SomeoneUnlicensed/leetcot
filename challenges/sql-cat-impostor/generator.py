import random

names = ['Мурзик', 'Васька', 'Барсик', 'Рыжик', 'Снежок']
random.shuffle(names)

# Guarantee at least two names each appear 2+ times, and at least one appears once.
dup_names = names[:2]
unique_names = names[2:4]

rows = []
row_id = 1
for name in dup_names:
    for _ in range(random.randint(2, 3)):
        rows.append((row_id, name))
        row_id += 1
for name in unique_names:
    rows.append((row_id, name))
    row_id += 1

random.shuffle(rows)
rows = [(i + 1, name) for i, (_, name) in enumerate(rows)]

values = ', '.join(f"({rid},'{name}','2024-01-0{(rid % 9) + 1}')" for rid, name in rows)
GENERATED_SEED = f"INSERT INTO cats VALUES {values};"
