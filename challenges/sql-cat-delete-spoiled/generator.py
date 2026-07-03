import random
from datetime import date, timedelta

# Same fixture shape as sql-cat-date-expiry: solution.sql hardcodes the cutoff
# date '2026-06-24', so generated dates stay spread around that anchor.
anchor = date(2026, 6, 24)
items = ['тунец', 'лосось', 'сметана', 'сухой корм', 'творог', 'йогурт']
random.shuffle(items)
chosen = items[: random.randint(4, 6)]

rows = []
for i, item in enumerate(chosen):
    offset = random.randint(-20, 20)
    expires_at = anchor + timedelta(days=offset)
    rows.append((i + 1, item, expires_at.isoformat()))

values = ', '.join(f"({rid}, '{item}', '{d}')" for rid, item, d in rows)
GENERATED_SEED = f"INSERT INTO pantry (id, item, expires_at) VALUES {values};"
