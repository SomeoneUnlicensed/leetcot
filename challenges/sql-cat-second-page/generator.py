import random

names = ['Мурка', 'Барсик', 'Патч', 'Снежок', 'Линт', 'Рыжик', 'Пушок', 'Дымка']
random.shuffle(names)
chosen = names[: random.randint(5, 7)]

used_points = set()
rows = []
for name in chosen:
    while True:
        points = random.randint(10, 150)
        if points not in used_points:
            used_points.add(points)
            break
    rows.append((name, points))

values = ', '.join(f"('{name}', {points})" for name, points in rows)
GENERATED_SEED = f"INSERT INTO leaderboard (cat, points) VALUES {values};"
