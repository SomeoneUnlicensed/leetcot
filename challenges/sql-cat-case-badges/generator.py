import random

names = ['Барсик', 'Васька', 'Мурзик', 'Соня', 'Тихон', 'Снежок', 'Патч', 'Дымка', 'Рыжик', 'Симба']
random.shuffle(names)
chosen = names[: random.randint(4, 6)]

used_points = set()
rows = []
for name in chosen:
    while True:
        points = random.randint(20, 100)
        if points not in used_points:
            used_points.add(points)
            break
    rows.append(f"('{name}', {points})")

GENERATED_SEED = f"INSERT INTO scores (cat, points) VALUES {', '.join(rows)};"
