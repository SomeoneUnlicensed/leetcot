import random

cats = ['Барсик', 'Васька', 'Мурзик', 'Соня', 'Тихон', 'Снежок', 'Патч']
random.shuffle(cats)
n = random.randint(5, 7)
chosen = cats[:n]

# A small value pool relative to `n` forces at least one repeated fish_count, so the
# challenge always actually exercises DENSE_RANK's "no gaps on ties" behavior.
pool_size = max(2, n - 2)
value_pool = random.sample(range(1, 25), pool_size)
counts = [random.choice(value_pool) for _ in chosen]
if len(set(counts)) == len(counts):
    counts[1] = counts[0]

rows = [f"('{cat}', {count})" for cat, count in zip(chosen, counts)]
GENERATED_SEED = f"INSERT INTO catches (cat, fish_count) VALUES {', '.join(rows)};"
