import random

cats = ['Барсик', 'Васька', 'Мурзик', 'Соня', 'Тихон', 'Снежок']
random.shuffle(cats)
chosen = cats[: random.randint(3, 5)]
fishes = ['лосось', 'тунец', 'карась', 'треска', 'окунь', 'сельдь']

rows = []
for cat in chosen:
    for _ in range(random.randint(1, 3)):
        fish = random.choice(fishes)
        grams = random.randint(50, 250)
        rows.append(f"('{cat}', '{fish}', {grams})")

GENERATED_SEED = f"INSERT INTO orders (cat, fish, grams) VALUES {', '.join(rows)};"
