import random
from datetime import date, timedelta

# solution.sql hardcodes the cutoff '2024-02-01' — keep generated dates spread
# around that same anchor so the DELETE's boundary condition is exercised.
anchor = date(2024, 2, 1)
fish_types = ['Сёмга', 'Треска', 'Тунец', 'Карп', 'Лосось', 'Скумбрия', 'Форель']
random.shuffle(fish_types)
chosen = fish_types[: random.randint(5, 7)]

rows = []
for i, fish in enumerate(chosen):
    offset_days = random.randint(-30, 30)
    meal_date = anchor + timedelta(days=offset_days)
    quantity = random.randint(1, 20)
    rows.append((i + 1, fish, quantity, meal_date.isoformat()))

values = ', '.join(f"({rid},'{fish}',{qty},'{d}')" for rid, fish, qty, d in rows)
GENERATED_SEED = f"INSERT INTO inventory VALUES {values};"
