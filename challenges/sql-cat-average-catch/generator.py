import random

teams = ['лапки', 'усы', 'хвосты', 'когти', 'уши']
random.shuffle(teams)
chosen = teams[: random.randint(3, 5)]

used_avgs = set()
rows = []
row_id = 1
for team in chosen:
    while True:
        n_catches = random.randint(1, 3)
        base = random.randint(3, 25)
        counts = [base + random.randint(-2, 2) for _ in range(n_catches)]
        avg = round(sum(counts) / len(counts), 1)
        if avg not in used_avgs:
            used_avgs.add(avg)
            break
    for c in counts:
        rows.append((row_id, team, max(c, 1)))
        row_id += 1

values = ', '.join(f"({rid}, '{team}', {count})" for rid, team, count in rows)
GENERATED_SEED = f"INSERT INTO catches (id, team, fish_count) VALUES {values};"
