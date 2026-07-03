import random

names = ['Барсик', 'Мурка', 'Патч', 'Рыжик', 'Снежок']
random.shuffle(names)
chosen = names[: random.randint(3, 5)]

# Cover all three tiers, including boundary values (50, 100).
boundary_points = [49, 50, 99, 100]
rows = []
for i, name in enumerate(chosen):
    if i < len(boundary_points) and random.random() < 0.5:
        points = boundary_points[i]
    else:
        points = random.randint(0, 200)
    rows.append((name, points))

values = ', '.join(f"('{name}', {points}, NULL)" for name, points in rows)
GENERATED_SEED = f"INSERT INTO awards (cat, points, tier) VALUES {values};"
