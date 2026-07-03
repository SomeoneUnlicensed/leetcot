import random

names = ['Барсик', 'Мурка', 'Снежок', 'Патч', 'Рыжик']
random.shuffle(names)
chosen = names[: random.randint(3, 5)]
cats = [(i + 1, name) for i, name in enumerate(chosen)]

foods = ['тунец', 'лосось', 'сметана', 'сардина']
used_counts = set()
meals = []
meal_id = 1
for cid, _ in cats:
    while True:
        count = random.randint(0, 4)
        if count not in used_counts:
            used_counts.add(count)
            break
    for _ in range(count):
        meals.append((meal_id, cid, random.choice(foods)))
        meal_id += 1

cats_values = ', '.join(f"({cid}, '{name}')" for cid, name in cats)
meals_values = ', '.join(f"({mid}, {cid}, '{food}')" for mid, cid, food in meals) or None

parts = [f"INSERT INTO cats (id, name) VALUES {cats_values};"]
if meals_values:
    parts.append(f"INSERT INTO meals (id, cat_id, food) VALUES {meals_values};")
GENERATED_SEED = ' '.join(parts)
