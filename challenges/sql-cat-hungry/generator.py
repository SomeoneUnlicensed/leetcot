import random

names = ['Мурзик', 'Васька', 'Барсик', 'Рыжик', 'Снежок', 'Дымка']
random.shuffle(names)
chosen = names[: random.randint(4, 6)]

cats_values = ', '.join(f"({i + 1},'{name}')" for i, name in enumerate(chosen))

used_totals = set()
meals = []
meal_id = 1
for i, _ in enumerate(chosen):
    cat_id = i + 1
    while True:
        total = random.randint(1, 30)
        if total not in used_totals:
            used_totals.add(total)
            break
    # Split the total across 1-2 meals so joins/grouping are actually exercised.
    if total > 1 and random.random() < 0.6:
        first = random.randint(1, total - 1)
        parts = [first, total - first]
    else:
        parts = [total]
    for part in parts:
        meals.append((meal_id, cat_id, part))
        meal_id += 1

meals_values = ', '.join(f"({mid},{cid},{count},'2024-01-0{(mid % 9) + 1}')" for mid, cid, count in meals)

GENERATED_SEED = (
    f"INSERT INTO cats VALUES {cats_values}; "
    f"INSERT INTO meals VALUES {meals_values};"
)
