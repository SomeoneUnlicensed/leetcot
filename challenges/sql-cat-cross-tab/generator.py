import random

names = ['Барсик', 'Мурка', 'Патч', 'Рыжик']
random.shuffle(names)
chosen = names[: random.randint(3, 4)]

rows = []
for name in chosen:
    has_day = random.random() < 0.85
    has_night = random.random() < 0.85
    if not has_day and not has_night:
        has_day = True
    if has_day:
        rows.append((name, 'day', random.randint(1, 15)))
    if has_night:
        rows.append((name, 'night', random.randint(1, 15)))

values = ', '.join(f"('{name}', '{shift}', {count})" for name, shift, count in rows)
GENERATED_SEED = f"INSERT INTO shifts (cat, shift, fish_count) VALUES {values};"
