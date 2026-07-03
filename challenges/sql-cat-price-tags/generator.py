import random

fish_names = ['килька', 'окунь', 'лосось', 'сом', 'треска', 'судак', 'карась']
random.shuffle(fish_names)
chosen = fish_names[: random.randint(4, 6)]

# Cover all three price buckets, including values right at the boundaries (80, 150).
boundary_prices = [79, 80, 150, 151]
rows = []
for i, fish in enumerate(chosen):
    if i < len(boundary_prices) and random.random() < 0.5:
        price = boundary_prices[i]
    else:
        price = random.randint(10, 300)
    rows.append((i + 1, fish, price))

values = ', '.join(f"({rid}, '{fish}', {price})" for rid, fish, price in rows)
GENERATED_SEED = f"INSERT INTO market (id, fish, price) VALUES {values};"
