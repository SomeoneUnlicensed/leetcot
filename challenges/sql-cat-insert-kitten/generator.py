import random

# solution.sql hardcodes INSERT ... VALUES (3, 'Скрипт', 1) — existing seed rows
# must never use id 3, but their names/levels/count can vary.
names = ['Пиксель', 'Байт', 'Тег', 'Форк', 'Коммит']
random.shuffle(names)
chosen = names[: random.randint(2, 4)]
ids = list(range(1, len(chosen) + 2))
ids.remove(3) if 3 in ids else None
ids = ids[: len(chosen)]

rows = [(ids[i], name, random.randint(1, 5)) for i, name in enumerate(chosen)]
values = ', '.join(f"({rid}, '{name}', {level})" for rid, name, level in rows)
GENERATED_SEED = f"INSERT INTO kittens (id, name, level) VALUES {values};"
