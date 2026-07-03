import random

names = ['Барсик', 'Мурка', 'Снежок', 'Патч', 'Рыжик', 'Дымка']
random.shuffle(names)
chosen = names[: random.randint(4, 6)]
cats = [(i + 1, name) for i, name in enumerate(chosen)]

foods = ['тунец', 'лосось', 'сардина', 'креветки']
n_fed = random.randint(1, len(cats) - 1)
fed_cats = random.sample(cats, n_fed)

feedings = []
feeding_id = 1
for cid, _ in fed_cats:
    for _ in range(random.randint(1, 2)):
        feedings.append((feeding_id, cid, random.choice(foods)))
        feeding_id += 1

cats_values = ', '.join(f"({cid}, '{name}')" for cid, name in cats)
feedings_values = ', '.join(f"({fid}, {cid}, '{food}')" for fid, cid, food in feedings)

GENERATED_SEED = (
    f"INSERT INTO cats (id, name) VALUES {cats_values}; "
    f"INSERT INTO feedings (id, cat_id, food) VALUES {feedings_values};"
)
