import random

fish_names = ['килька', 'окунь', 'сом', 'карась', 'лосось', 'треска', 'судак']
random.shuffle(fish_names)
chosen = fish_names[: random.randint(5, 7)]

used_weights = set()
rows = []
for i, fish in enumerate(chosen):
    while True:
        weight = random.randint(20, 350)
        if weight not in used_weights:
            used_weights.add(weight)
            break
    rows.append((i + 1, fish, weight))

values = ', '.join(f"({rid}, '{fish}', {weight})" for rid, fish, weight in rows)
GENERATED_SEED = f"INSERT INTO fishes (id, name, weight) VALUES {values};"
