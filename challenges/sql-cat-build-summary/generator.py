import random

names = ['Барсик', 'Мурка', 'Патч', 'Рыжик', 'Снежок']
random.shuffle(names)
chosen = names[: random.randint(3, 5)]

used_totals = set()
rows = []
for name in chosen:
    n = random.randint(1, 3)
    while True:
        counts = [random.randint(1, 15) for _ in range(n)]
        total = sum(counts)
        if total not in used_totals:
            used_totals.add(total)
            break
    for c in counts:
        rows.append((name, c))

values = ', '.join(f"('{name}', {count})" for name, count in rows)
GENERATED_SEED = f"INSERT INTO catches (cat, fish_count) VALUES {values};"
