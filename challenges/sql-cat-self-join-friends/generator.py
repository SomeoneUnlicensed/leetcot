import random

mentor_names = ['Барсик', 'Мурка', 'Дымка']
kitten_names = ['Пиксель', 'Байт', 'Скрипт', 'Тег', 'Форк']
random.shuffle(mentor_names)
mentors = mentor_names[: random.randint(2, 3)]
random.shuffle(kitten_names)
kittens = kitten_names[: random.randint(2, 4)]

rows = []
row_id = 1
mentor_ids = []
for name in mentors:
    rows.append((row_id, name, None))
    mentor_ids.append(row_id)
    row_id += 1
for name in kittens:
    rows.append((row_id, name, random.choice(mentor_ids)))
    row_id += 1

values = ', '.join(
    f"({rid}, '{name}', {mentor_id if mentor_id is not None else 'NULL'})"
    for rid, name, mentor_id in rows
)
GENERATED_SEED = f"INSERT INTO cats (id, name, mentor_id) VALUES {values};"
