import random

dry_names = ['сухой корм', 'тунец', 'печенье', 'крекеры', 'мюсли']
cold_names = ['лосось', 'тунец', 'сметана', 'йогурт', 'творог']

random.shuffle(dry_names)
random.shuffle(cold_names)
dry_chosen = dry_names[: random.randint(2, 4)]
cold_chosen = cold_names[: random.randint(2, 4)]

# Guarantee at least one overlapping name between the two pantries.
if not (set(dry_chosen) & set(cold_chosen)):
    cold_chosen[0] = dry_chosen[0]

dry_values = ', '.join(f"('{name}')" for name in dry_chosen)
cold_values = ', '.join(f"('{name}')" for name in cold_chosen)
GENERATED_SEED = (
    f"INSERT INTO dry_pantry (name) VALUES {dry_values}; "
    f"INSERT INTO cold_pantry (name) VALUES {cold_values};"
)
