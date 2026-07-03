import random

names = ['Барсик', 'Мурка', 'Патч', 'Рыжик', 'Снежок']
random.shuffle(names)
chosen = names[: random.randint(3, 5)]
cats = [(i + 1, name) for i, name in enumerate(chosen)]

titles = ['SQL-ус', 'JOIN-лапа', 'SELECT-хвост', 'INSERT-коготь']
n_with_medal = random.randint(1, len(cats) - 1)
with_medal = random.sample(cats, n_with_medal)

medals = []
medal_id = 1
for cid, _ in with_medal:
    for _ in range(random.randint(1, 2)):
        medals.append((medal_id, cid, random.choice(titles)))
        medal_id += 1

cats_values = ', '.join(f"({cid}, '{name}')" for cid, name in cats)
medals_values = ', '.join(f"({mid}, {cid}, '{title}')" for mid, cid, title in medals)

parts = [f"INSERT INTO cats (id, name) VALUES {cats_values};"]
if medals_values:
    parts.append(f"INSERT INTO medals (id, cat_id, title) VALUES {medals_values};")
GENERATED_SEED = ' '.join(parts)
