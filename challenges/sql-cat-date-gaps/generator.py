import random
from datetime import date, timedelta

# The prompt states "today" is 2026-06-25, and solution.sql hardcodes that same
# anchor — keep generated feedings on or before it so "days since" stays meaningful.
ANCHOR = date(2026, 6, 25)

cats = ['Барсик', 'Васька', 'Мурзик', 'Соня', 'Тихон']
random.shuffle(cats)
chosen = cats[: random.randint(3, 5)]

rows = []
for cat in chosen:
    for _ in range(random.randint(1, 3)):
        fed_at = ANCHOR - timedelta(days=random.randint(0, 20))
        rows.append(f"('{cat}', '{fed_at.isoformat()}')")

GENERATED_SEED = f"INSERT INTO feedings (cat, fed_at) VALUES {', '.join(rows)};"
