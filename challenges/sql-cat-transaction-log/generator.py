import random

names = ['Барсик', 'Мурка', 'Патч', 'Рыжик', 'Снежок']
random.shuffle(names)
chosen = names[: random.randint(4, 6)]

# Cover both sides of the >= 100 threshold, including the boundary itself.
boundary_amounts = [99, 100, 100]
rows = []
for i, name in enumerate(chosen):
    if i < len(boundary_amounts) and random.random() < 0.5:
        amount = boundary_amounts[i]
    else:
        amount = random.randint(20, 200)
    rows.append((i + 1, name, amount))

values = ', '.join(f"({rid}, '{name}', {amount})" for rid, name, amount in rows)
GENERATED_SEED = f"INSERT INTO purchases (id, cat, amount) VALUES {values};"
