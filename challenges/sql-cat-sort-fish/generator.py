import random

fish_names = ['Карась мелкий', 'Окунь жирный', 'Золотая рыбка', 'Плотва', 'Сом гигант', 'Ёрш', 'Щука']
random.shuffle(fish_names)
chosen = fish_names[: random.randint(5, 7)]

used_weights = set()
rows = []
for i, fish in enumerate(chosen):
    while True:
        weight = random.randint(50, 600)
        if weight not in used_weights:
            used_weights.add(weight)
            break
    rows.append((i + 1, fish, weight))

# Make sure both above-100 and 100-or-below weights exist.
if all(w > 100 for _, _, w in rows):
    rid, name, _ = rows[0]
    rows[0] = (rid, name, 90)
if all(w <= 100 for _, _, w in rows):
    rid, name, _ = rows[-1]
    rows[-1] = (rid, name, 250)

values = ', '.join(f"({rid}, '{name}', {weight})" for rid, name, weight in rows)
GENERATED_SEED = f"INSERT INTO fishes (id, name, weight) VALUES {values};"
