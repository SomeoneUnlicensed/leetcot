import random

places = ['окно', 'диван', 'кухня', 'балкон', 'спальня', 'коридор', 'терраса']
dishes = ['тунец', 'лосось', 'сардина', 'форель', None, None]

random.shuffle(places)
chosen = places[: random.randint(4, 6)]

rows = []
for i, place in enumerate(chosen):
    dish = random.choice(dishes)
    dish_sql = 'NULL' if dish is None else f"'{dish}'"
    rows.append(f"({i + 1}, '{place}', {dish_sql})")

# Guarantee at least one empty bowl so the puzzle always has a real answer.
if 'NULL' not in ' '.join(rows):
    rows[0] = rows[0].rsplit(',', 1)[0] + ', NULL)'

GENERATED_SEED = f"INSERT INTO bowls (id, place, dish) VALUES {', '.join(rows)};"
