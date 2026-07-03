import random

hunters = ['Барсик', 'Мурка', 'Снежок', 'Рыжик', 'Дымка', 'Патч']
random.shuffle(hunters)
chosen = hunters[: random.randint(4, 6)]

rows = []
row_id = 1
for hunter in chosen:
    n_hunts = random.randint(1, 3)
    for _ in range(n_hunts):
        rows.append((row_id, hunter, random.randint(1, 8)))
        row_id += 1

# Make sure at least one hunter crosses the >=10 threshold and one doesn't.
totals = {}
for _, hunter, count in rows:
    totals[hunter] = totals.get(hunter, 0) + count

if all(total < 10 for total in totals.values()):
    boost_hunter = chosen[0]
    rows.append((row_id, boost_hunter, 12))
    row_id += 1
if all(total >= 10 for total in totals.values()):
    # Force one hunter below the threshold by only keeping their first hunt.
    weak_hunter = chosen[-1]
    rows = [r for r in rows if r[1] != weak_hunter] + [(row_id, weak_hunter, 3)]

values = ', '.join(f"({rid}, '{hunter}', {count})" for rid, hunter, count in rows)
GENERATED_SEED = f"INSERT INTO hunts (id, hunter, fish_count) VALUES {values};"
