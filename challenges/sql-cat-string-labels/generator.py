import random

names = ['Барсик', 'Васька', 'Мурзик', 'Соня', 'Тихон', 'Снежок']
colors = ['зеленая', 'синяя', 'желтая', 'красная', 'фиолетовая']
random.shuffle(names)
chosen = names[: random.randint(3, 5)]

rows = [f"('{cat}', '{random.choice(colors)}')" for cat in chosen]
GENERATED_SEED = f"INSERT INTO cats (cat, carrier_color) VALUES {', '.join(rows)};"
