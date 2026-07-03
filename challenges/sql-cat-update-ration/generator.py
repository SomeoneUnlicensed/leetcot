import random

names = ['Барсик', 'Мурка', 'Патч', 'Рыжик', 'Снежок']
random.shuffle(names)
chosen = names[: random.randint(3, 5)]

n_active = random.randint(1, len(chosen) - 1)
active_set = set(random.sample(chosen, n_active))

rows = [(name, random.randint(30, 100), 1 if name in active_set else 0) for name in chosen]
values = ', '.join(f"('{name}', {grams}, {active})" for name, grams, active in rows)
GENERATED_SEED = f"INSERT INTO rations (cat, grams, active) VALUES {values};"
