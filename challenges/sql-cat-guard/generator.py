import random

# solution.sql inserts a specific new row ('Граф', 'ночная', 25) — the seed must
# not already contain that name, but the other filler rows can vary freely.
names = ['Мурзик', 'Васька', 'Барсик', 'Рыжик', 'Снежок']
random.shuffle(names)
chosen = names[: random.randint(3, 5)]
shifts = ['дневная', 'ночная']

rows = [(name, random.choice(shifts), random.randint(15, 30)) for name in chosen]
values = ', '.join(f"('{name}','{shift}',{salary})" for name, shift, salary in rows)
GENERATED_SEED = f"INSERT INTO guards (name, shift, fish_salary) VALUES {values};"
